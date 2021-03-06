import { StopWatch } from '@mskg/tabler-world-common';
import { writeJobLog } from '@mskg/tabler-world-jobs';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import Expo from 'expo-server-sdk';
import _ from 'lodash';
import { removeToken } from './services/removeToken';
import { Receipts } from './types/Receipts';

const expo = new Expo();

// tslint:disable: max-func-body-length
// tslint:disable: export-name
// tslint:disable-next-line: variable-name
export async function handler(_event: any, context: Context, _callback: (error: any, success?: any) => void) {
    try {
        return await withDatabase(context, async (client) => {
            let errors = 0;
            let hardFails = 0;
            let recipients = 0;

            const watch = new StopWatch();

            const result = await client.query('select * from notification_receipts');

            for (const row of result.rows) {
                const rr = row as Receipts;
                console.log('Processing', rr.id, 'from', rr.createdon, rr.data);

                // The receipts may contain error codes to which you must respond. In
                // particular, Apple or Google may block apps that continue to send
                // notifications to devices that have blocked notifications or have uninstalled
                // your app. Expo does not control this policy and sends back the feedback from
                // Apple and Google so you can handle it appropriately.
                const receiptIds = [];
                for (const ticket of rr.data) {
                    // NOTE: Not all tickets have IDs; for example, tickets for notifications
                    // that could not be enqueued will have error information and no receipt ID.
                    if (ticket.status === 'ok' && ticket.id) {
                        recipients += 1;
                        receiptIds.push(ticket.id);
                    }
                }

                const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

                // Like sending notifications, there are different strategies you could use
                // to retrieve batches of receipts from the Expo service.
                for (const chunk of receiptIdChunks) {
                    try {
                        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                        console.log(receipts);

                        // The receipts specify whether Apple or Google successfully received the
                        // notification and information about an error, if one occurred.
                        for (const receipt of _(receipts).values().toArray().value()) {
                            if (receipt.status === 'ok') {
                                continue;
                            } else if (receipt.status === 'error') {
                                console.error(`There was an error sending a notification: ${receipt.message}`);

                                if (receipt.details && receipt.details.error) {
                                    errors += 1;

                                    // The error codes are listed in the Expo documentation:
                                    // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                                    // You must handle the errors appropriately.
                                    console.error(`The error code is ${receipt.details.error}`);

                                    if (receipt.details.error === 'DeviceNotRegistered') {
                                        /*
                                        {
                                            "status": "error",
                                            "details": {
                                                "error": "DeviceNotRegistered"
                                            },
                                            "message": "\"ExponentPushToken[3teo6uPMagY6QiFY3MX8tG]\" is not a registered push notification recipient"
                                        }
                                        */
                                        await removeToken(
                                            client,
                                            receipt.message
                                                .substring(0, receipt.message.indexOf(' '))
                                                .trim(),
                                        );
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        hardFails += 1;
                        console.error(error);
                    }
                }

                await client.query('delete from notification_receipts where id = $1', [rr.id]);
            }

            await writeJobLog(client, 'notifications::check', true, {
                errors,
                hardFails,
                recipients,
                records: result.rowCount,
                executionTime: watch.stop(),
                awsRequestId: context.awsRequestId,
            });

            return true;
        });
    } catch (e) {
        try {
            await withDatabase(context, async (client) => {
                await writeJobLog(client, 'notifications::check', false, {
                    error: e,
                    awsRequestId: context.awsRequestId,
                });
            });
            // tslint:disable-next-line: no-empty
        } catch { }

        console.error(e);
        throw e;
    }
}
