import { StopWatch } from "@mskg/tabler-world-common";
import { IDataService, withDatabase } from "@mskg/tabler-world-rds";
import { Context } from "aws-lambda";
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { writeJobLog } from "../shared/jobs/writeJobLog";

let expo = new Expo();

const Message = {
    title: "Birthday time",
    text: (n: any) => `Help ${n} to have a great day!`,
};

type BirthdayNotification = {
    userid: number,
    rtemail: string,
    tokens: string[],
    bid: number,
    firstname: string,
    lastname: string,
}

async function removeToken(client: IDataService, id: number, token: string) {
    return await client.query(`
UPDATE usersettings
SET tokens =
(
    select array_agg(elem)
    from unnest(tokens) elem
    where elem <> $2 and elem is not null
)
WHERE id = $1`,
        //@ts-ignore
        [id, token]);
}

async function putReceipts(client: IDataService, tickets: ExpoPushTicket[]) {
    return await client.query(`
insert into notification_receipts (createdon, data)
values ($1, $2)`,
        //@ts-ignore
        [new Date(), JSON.stringify(tickets)]);
}

type BirthdayPayload = {
    title: string,
    body: string,
    reason: 'birthday',
    payload: {
        userid: number,
        date: Date,
        id: number,
    },
};

export async function handler(_event: Array<any>, context: Context, _callback: (error: any, success?: any) => void) {
    try {
        return await withDatabase(context, async (client) => {
            let errors = 0;
            let hardFails = 0;
            const watch = new StopWatch();

            const result = await client.query("select * from notification_birthdays");
            let messages: ExpoPushMessage[] = [];

            const invalides: {[key: string]: boolean} = {}
            for (let row of result.rows) {
                const br = row as BirthdayNotification;

                // Create the messages that you want to send to clents
                for (let pushToken of br.tokens) {
                    // Check that all your push tokens appear to be valid Expo push tokens
                    if (!Expo.isExpoPushToken(pushToken)) {
                        if (invalides[pushToken] === true) continue;
                        console.error(`Removing token ${pushToken} for ${br.rtemail}`);

                        invalides[pushToken] = true;
                        await removeToken(client, br.userid, pushToken);
                        continue;
                    }

                    console.log("Adding notification for", br.rtemail, "to", br.bid);

                    messages.push({
                        to: pushToken,
                        sound: 'default',
                        title: Message.title,
                        body: Message.text(br.firstname + " " + br.lastname),
                        data: {
                            title: Message.title,
                            body: Message.text(br.firstname + " " + br.lastname),
                            reason: 'birthday',
                            payload: {
                                userid: br.userid,
                                date: new Date(),
                                id: br.bid,
                            },
                        },
                    })
                }
            }

            // Send the chunks to the Expo push notification service.
            let chunks = expo.chunkPushNotifications(messages);
            // let tickets = [];
            for (let chunk of chunks) {
                try {

                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);

                    await putReceipts(client, ticketChunk);
                    // tickets.push(...ticketChunk);

                    for (let i = 0; i< ticketChunk.length; ++i) {
                        const ticket = ticketChunk[i];

                        if (ticket.status === "error" && ticket.details != null) {
                            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                            ++errors;

                            if (ticket.details.error === "DeviceNotRegistered") {
                                const pushToken = chunk[i].to;
                                if (invalides[pushToken] === true) continue;

                                const data = chunk[i].data as BirthdayPayload;
                                const userid = data.payload.userid;

                                invalides[pushToken] = true;
                                console.error(`Removing token ${pushToken} for ${userid}`);

                                await removeToken(client, userid, pushToken);
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
                    error: e
                });
            })
        }
        catch { }

        console.error(e);
        throw e;
    }
};
