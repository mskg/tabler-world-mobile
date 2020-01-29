import { writeJobLog } from '@mskg/tabler-world-jobs';
import { PushNotification } from '@mskg/tabler-world-push-client';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { SQSHandler } from 'aws-lambda';
import { ExpoPushMessage } from 'expo-server-sdk';
import { filter, flatMap, map, uniq } from 'lodash';
import { ExpoPushNotificationManager } from './services/ExpoPushNotificationManager';

// we have a batchsize of 1, and max parallelism of 1
// tslint:disable-next-line: export-name
export const handler: SQSHandler = async (event, context) => {
    let pushMessages: ExpoPushMessage[];

    try {
        const mgr = new ExpoPushNotificationManager();

        // max degree 1
        await withDatabase(context, async (client) => {
            const msgs = await Promise.all(event.Records.map(async (message) => {
                const payload = JSON.parse(message.body) as PushNotification<any>[];

                const allTokens = await client.query(
                    'select id, tokens from usersettings where id = ANY($1)',
                    [payload.map((m) => m.member)],
                );

                const normalizedTokens: { [key: number]: string[] } = {};

                for (const row of allTokens.rows) {
                    // for whatever reason the id is a string?
                    normalizedTokens[parseInt(row.id, 10)] = row.tokens;
                }

                console.log(normalizedTokens);

                return flatMap(payload.map((p) => {
                    const tokens = uniq(normalizedTokens[p.member] || []);

                    return map(
                        filter(
                            tokens,
                            (t: string) => t != null && t !== '',
                        ),
                        (t: string) => mgr.convert(p, t),
                    );
                }));
            }));

            pushMessages = flatMap(msgs);
            console.log(pushMessages);

            const sendResult = await mgr.send(pushMessages);
            console.log('push::send', {
                errors: sendResult.errors,
                hardFails: sendResult.hardFails,
                recipients: msgs.length,
            });

            // await writeJobLog(client, 'push::send', true, {
            //     errors: sendResult.errors,
            //     hardFails: sendResult.hardFails,
            //     recipients: event.Records.length,
            // });
        });
    } catch (e) {
        try {
            await withDatabase(context, async (client) => {
                await writeJobLog(client, 'push::send', false, {
                    awsRequestId: context.awsRequestId,
                    error: e,
                    messages: pushMessages,
                });
            });
            // tslint:disable-next-line: no-empty
        } catch { }

        console.error(e);
    }
};
