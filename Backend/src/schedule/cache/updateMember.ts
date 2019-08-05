import { makeCacheKey } from "../../shared/cache/makeCacheKey";
import { IDataService } from "../../shared/rds/IDataService";
import { xAWS } from "../../shared/xray/aws";
import { cache } from "./cacheInstance";
import { updateClub } from "./updateClub";

export async function updateMember(client: IDataService, id: number) {
    const key = makeCacheKey("Member", [id]);
    const staleCacheData = await cache.get(key);

    const res = await client.query(`select * from profiles where id = $1 and removed = FALSE`, [id]);
    const newMember = res.rows.length == 1 ? res.rows[0] : undefined;

    if (newMember == null) {
        if (staleCacheData != null) {
            // we update the memberlist here
            const oldMember = JSON.parse(staleCacheData);
            const clubKey = makeCacheKey("Club", [oldMember.association + "_" + oldMember.club]);

            console.log("Removing", clubKey);
            cache.delete(clubKey);
        }

        console.log("Removing", key);
        cache.delete(key);
    }
    else {
        if (staleCacheData != null) {
            // we update the memberlist here
            const oldMember = JSON.parse(staleCacheData);
            if (oldMember.club !== newMember.club) {
                await updateClub(client, oldMember.association, oldMember.club);
            }
        }

        console.log("Updating", key);
        cache.set(key, JSON.stringify(newMember));

        const addresses = [
            newMember.address,
        ];

        if (newMember.companies) {
            for (let company of newMember.companies) {
                addresses.push(company.address);
            }
        }

        var sqs = new xAWS.SQS();
        await sqs.sendMessage({
            QueueUrl: process.env.geocode_queue as string,
            MessageBody: JSON.stringify(addresses)
        }).promise();

        // member list could have changed
        await updateClub(client, newMember.association, newMember.club);
    }
}
