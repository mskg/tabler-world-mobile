import { StopWatch } from '@mskg/tabler-world-common';
import { writeJobLog } from '@mskg/tabler-world-jobs';
import { PushNotification, PushNotificationService } from '@mskg/tabler-world-push-client';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import { Message } from './helper/Message';
import { BirthdayNotification } from './types/BirthdayNotification';
import { BirthdaySendPayload } from './types/BirthdayPayload';

// tslint:disable: export-name
// tslint:disable-next-line: variable-name
export async function handler(_event: any, context: Context, _callback: (error: any, success?: any) => void) {
    try {
        return await withDatabase(context, async (client) => {
            const watch = new StopWatch();

            const result = await client.query('select * from notification_birthdays');
            const messages: PushNotification<BirthdaySendPayload>[] = [];

            for (const row of result.rows) {
                const br = row as BirthdayNotification;

                messages.push({
                    member: br.userid,
                    reason: 'birthday',

                    title: Message.lang(br.lang).title,
                    body: Message.lang(br.lang).text(`${br.firstname} ${br.lastname}`),

                    payload: {
                        payload: {
                            userid: br.userid,
                            date: new Date(),
                            id: br.bid,
                        },
                    },

                    options: { sound: 'default' },
                });
            }

            const service = new PushNotificationService();
            await service.send(messages);

            await writeJobLog(client, 'notifications::sendBirthday', true, {
                recipients: result.rowCount,
                executionTime: watch.stop(),
                awsRequestId: context.awsRequestId,
            });

            return true;
        });
    } catch (e) {
        try {
            await withDatabase(context, async (client) => {
                await writeJobLog(client, 'notifications::sendBirthday', false, {
                    error: e,
                    awsRequestId: context.awsRequestId,
                });
            });
            // tslint:disable-next-line: no-empty
        } catch { }

        console.error(e);
        throw e;
    }
};
