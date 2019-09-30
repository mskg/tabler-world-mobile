import { writeJobLog } from '@mskg/tabler-world-jobs';
import { PushNotification } from '@mskg/tabler-world-push-client';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { SQSHandler } from 'aws-lambda';
import { flatMap, uniq } from 'lodash';
import { ExpoPushNotificationManager } from './services/ExpoPushNotificationManager';

// we have a batchsize of 1, and max parallelism of 1
// tslint:disable-next-line: export-name
export const handler: SQSHandler = async (event, context) => {
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

                return flatMap(payload.map((p) => {
                    const tokens = uniq(
                        flatMap(
                            allTokens.rows
                                .find((r) => r.id === p.member)
                                .map((r: any) => r.tokens),
                        ),
                    ) as string[];

                    return tokens.map((t: string) => mgr.convert(p, t));
                }));
            }));

            const sendResult = await mgr.send(flatMap(msgs));

            await writeJobLog(client, 'push::send', true, {
                errors: sendResult.errors,
                hardFails: sendResult.hardFails,
                recipients: event.Records.length,
            });
        });
    } catch (e) {
        try {
            await withDatabase(context, async (client) => {
                await writeJobLog(client, 'push::send', false, {
                    error: e,
                });
            });
            // tslint:disable-next-line: no-empty
        } catch { }

        console.error(e);
    }
};
