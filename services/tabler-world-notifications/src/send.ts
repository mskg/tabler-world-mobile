import { StopWatch } from "@mskg/tabler-world-common";
import { writeJobLog } from "@mskg/tabler-world-jobs";
import { withDatabase } from "@mskg/tabler-world-rds-client";
import { Context } from "aws-lambda";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { putReceipts } from "./helper/putReceipts";
import { removeTokenWithId } from "./helper/removeTokenWithId";
import { Message } from "./Message";
import { BirthdayNotification } from "./types/BirthdayNotification";
import { BirthdayPayload } from "./types/BirthdayPayload";

const expo = new Expo();

// tslint:disable: max-func-body-length
// tslint:disable: export-name
// tslint:disable-next-line: variable-name
export async function handler(_event: any, context: Context, _callback: (error: any, success?: any) => void) {
    try {
        return await withDatabase(context, async (client) => {
            let errors = 0;
            let hardFails = 0;
            const watch = new StopWatch();

            const result = await client.query("select * from notification_birthdays");
            const messages: ExpoPushMessage[] = [];

            const invalides: {[key: string]: boolean} = {};
            for (const row of result.rows) {
                const br = row as BirthdayNotification;

                // Create the messages that you want to send to clents
                for (const pushToken of br.tokens) {
                    // Check that all your push tokens appear to be valid Expo push tokens
                    if (!Expo.isExpoPushToken(pushToken)) {
                        if (invalides[pushToken] === true) { continue; }
                        console.error(`Removing token ${pushToken} for ${br.rtemail}`);

                        invalides[pushToken] = true;
                        await removeTokenWithId(client, br.userid, pushToken);
                        continue;
                    }

                    console.log("Adding notification for", br.rtemail, "to", br.bid);

                    messages.push({
                        to: pushToken,
                        sound: "default",
                        title: Message.lang(br.lang).title,
                        body: Message.lang(br.lang).text(br.firstname + " " + br.lastname),

                        data: {
                            title: Message.lang(br.lang).title,
                            body: Message.lang(br.lang).text(br.firstname + " " + br.lastname),
                            reason: "birthday",
                            payload: {
                                userid: br.userid,
                                date: new Date(),
                                id: br.bid,
                            },
                        } as BirthdayPayload,
                    });
                }
            }

            // Send the chunks to the Expo push notification service.
            const chunks = expo.chunkPushNotifications(messages);
            // let tickets = [];
            for (const chunk of chunks) {
                try {

                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);

                    await putReceipts(client, ticketChunk);
                    // tickets.push(...ticketChunk);

                    for (let i = 0; i < ticketChunk.length; ++i) {
                        const ticket = ticketChunk[i];

                        if (ticket.status === "error" && ticket.details != null) {
                            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                            ++errors;

                            if (ticket.details.error === "DeviceNotRegistered") {
                                const pushToken = chunk[i].to;
                                if (invalides[pushToken] === true) { continue; }

                                const data = chunk[i].data as BirthdayPayload;
                                const userid = data.payload.userid;

                                invalides[pushToken] = true;
                                console.error(`Removing token ${pushToken} for ${userid}`);

                                await removeTokenWithId(client, userid, pushToken);
                            }
                        }
                    }
                } catch (error) {
                    ++hardFails;
                    console.error(error);
                }
            }

            await writeJobLog(client, "notifications::sendBirthday", true, {
                recipients: result.rowCount,
                errors,
                hardFails,
                executionTime: watch.stop(),
            });

            return true;
        });
    } catch (e) {
        try {
            await withDatabase(context, async (client) => {
                await writeJobLog(client, "notifications::sendBirthday", false, {
                    error: e,
                });
            });
        // tslint:disable-next-line: no-empty
        } catch { }

        console.error(e);
        throw e;
    }
};