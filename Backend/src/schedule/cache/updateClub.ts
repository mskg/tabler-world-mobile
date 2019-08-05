import { makeCacheKey } from "../../shared/cache/makeCacheKey";
import { IDataService } from "../../shared/rds/IDataService";
import { xAWS } from "../../shared/xray/aws";
import { cache } from "./cacheInstance";

// we keep an im memory hash of the last updated clubs
// the lambda is short lived, with a max degree of three
// this should prevent (some) duplicate/unnecessary updates
const updated: {
    [key: string]: number,
} = {};

const MINUTES_5 = 5 * 60 /* s */ * 1000 /* ms */;

export async function updateClub(client: IDataService, assoc: string, club: number) {
    const key = makeCacheKey("Club", [assoc + "_" + club]);

    if (updated[key] != null && Date.now() - updated[key] < MINUTES_5) {
        return;
    }

    const res = await client.query(
        `select * from structure_clubs where association = $1 and club = $2`,
        [assoc, club]);

    const newClub = res.rows.length == 1 ? res.rows[0] : undefined;

    updated[key] = Date.now();

    if (newClub != null) {
        console.log("Updating", key);
        cache.set(key, JSON.stringify(newClub));

        const addresses = [
            newClub.meetingplace1,
            newClub.meetingplace2,
        ];

        var sqs = new xAWS.SQS();
        await sqs.sendMessage({
            QueueUrl: process.env.geocode_queue as string,
            MessageBody: JSON.stringify(addresses)
        }).promise();
    }
    else {
        console.log("Removing", key);
        cache.delete(key);
    }
}
