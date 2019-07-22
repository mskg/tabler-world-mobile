import { SQSHandler } from "aws-lambda";
import { withClient } from "../helper/withClient";
import { updateClub } from "./cache/updateClub";
import { updateMember } from "./cache/updateMember";
import { QueueEntry } from "./QueueEntry";


export const handler: SQSHandler = async (event, context, callback) => {
    // max degree 3
    await withClient(context, async (client) => {
        for (let message of event.Records) {
            const payload = JSON.parse(message.body) as QueueEntry;

            if (payload.type === "club") {
                const ids = payload.id.split("_");
                await updateClub(client, ids[0], parseInt(ids[1], 10));

            } else if (payload.type === "member") {
                await updateMember(client, payload.id);
            }
        }
    });

    callback();
}