import { ConsoleLogger } from '@mskg/tabler-world-common';
import { PushNotificationBase } from '@mskg/tabler-world-push-client';
import { IDataService, useDatabase } from '@mskg/tabler-world-rds-client';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { putReceipts } from './putReceipts';
import { removeToken } from './removeToken';

const logger = new ConsoleLogger('PushNotificationManager');

type Result = {
    errors: number,
    hardFails: number,
};

type InvalidMap = {
    [key: string]: boolean,
};

type MinimumPayload = {
    event: string,
};

export class ExpoPushNotificationManager {
    private expo = new Expo();
    private invalides: InvalidMap = {};

    public async removeToken(client: IDataService, pushToken: string) {
        logger.log('Removing invalid token', pushToken);
        // it's already invalid
        if (this.invalides[pushToken]) {
            return;
        }

        await removeToken(client, pushToken);
        this.invalides[pushToken] = true;
    }

    public convert<T extends MinimumPayload>(input: PushNotificationBase<T>, token: string): ExpoPushMessage {
        return {
            to: token,

            title: input.title,
            subtitle: input.subtitle,
            body: input.body,

            ...input.options || {},

            // we pass the payload and details down (again)
            data: {
                title: input.title,
                subtitle: input.subtitle,
                body: input.body,
                reason: input.reason,
                payload: input.payload,
            },
        } as ExpoPushMessage;
    }

    public async ensurePushToken(client: IDataService, pushToken: string): Promise<boolean> {
        if (this.invalides[pushToken]) {
            return false;
        }

        if (!Expo.isExpoPushToken(pushToken)) {
            await this.removeToken(client, pushToken);
            return false;
        }

        return true;
    }

    public async send(messages: ExpoPushMessage[]): Promise<Result> {
        let errors = 0;
        let hardFails = 0;

        return await useDatabase({ logger }, async (client) => {
            // Send the chunks to the Expo push notification service.
            const chunks = this.expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    // @ts-ignore
                    const validatedMsgs: ExpoPushMessage[] = (await Promise.all(chunk.map((msg) => {
                        if (this.ensurePushToken(client, msg.to as string)) {
                            return msg;
                        }

                        errors += 1;
                        return null;
                    }))).filter((m) => m != null);

                    const result = await this.expo.sendPushNotificationsAsync(validatedMsgs);
                    logger.log(result);

                    await putReceipts(client, result);

                    // tslint:disable-next-line: no-increment-decrement
                    for (let i = 0; i < result.length; ++i) {
                        const ticket = result[i];

                        if (ticket.status === 'error' && ticket.details != null) {
                            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                            errors += 1;

                            if (ticket.details.error === 'DeviceNotRegistered') {
                                const pushToken = chunk[i].to;
                                await this.removeToken(client, pushToken as string);
                            }
                        }
                    }
                } catch (error) {
                    hardFails += 1;
                    logger.error(error);
                }
            }

            return { errors, hardFails };
        });
    }
}
