import { SQSHandler } from "aws-lambda";
import { DynamoDBCache } from "../graphql/cache/DynamoDBCache";
import { makeCacheKey } from "../graphql/cache/makeCacheKey";
import { withClient } from "../helper/withClient";
import { QueueEntry } from "./QueueEntry";

export const handler: SQSHandler = async (event, context, callback) => {
    const cache = new DynamoDBCache(
        {
            region: process.env.AWS_REGION,
        },
        {
            tableName: process.env.cache_table as string,
        }
    );

    await withClient(context, async (client) => {
        for (let message of event.Records) {
            const payload = JSON.parse(message.body) as QueueEntry;

            if (payload.type === "clubs") {
                // need to clear that, hardcoded
                const key = makeCacheKey("Structure", ["all"]);

                console.log("Removing", key);
                cache.delete(key);
            } else if (payload.type === "member") {
                const key = makeCacheKey("Member", [payload.id]);
                const staleCacheData = await cache.get(key);

                const res = await client.query(`select * from profiles where id = $1 and removed = FALSE`, [payload.id]);
                const newMember = res.rows.length == 1 ? res.rows[0] : undefined;

                if (newMember == null) {
                    if (staleCacheData != null) {
                        // we update the memberlist here
                        const oldMember = JSON.parse(staleCacheData);
                        const clubKey = makeCacheKey("Members", [oldMember.association, "club", oldMember.club]);

                        console.log("Removing", clubKey);
                        cache.delete(clubKey);
                    }

                    console.log("Removing", key);
                    cache.delete(key);
                } else {
                    if (staleCacheData != null) {
                        // we update the memberlist here
                        const oldMember = JSON.parse(staleCacheData);

                        if (oldMember.club !== newMember.club) {
                            const oldClub = makeCacheKey("Members", [oldMember.association, "club", oldMember.club]);
                            console.log("Removing", oldClub);
                            cache.delete(oldClub);

                            const newClub = makeCacheKey("Members", [newMember.association, "club", newMember.club]);
                            console.log("Removing", newClub);
                            cache.delete(newClub);
                        }
                    }

                    console.log("Updating", key);
                    cache.set(key, JSON.stringify(newMember));
                }
            }
        }
    });

    callback();
}