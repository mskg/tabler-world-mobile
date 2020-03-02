import { xAWS } from '@mskg/tabler-world-aws';
import { makeCacheKey } from '@mskg/tabler-world-cache';
import { IDataService } from '@mskg/tabler-world-rds-client';
import { cacheInstance } from './cacheInstance';
import { cleanGlobalCaches } from './cleanGlobalCaches';
import { updateClub } from './updateClub';

export async function updateMember(client: IDataService, id: number) {
    const key = makeCacheKey('Member', [id]);
    const staleCacheData = await cacheInstance.get(key);

    const res = await client.query(`select * from profiles where id = $1 and removed = FALSE`, [id]);
    const newMember = res.rows.length === 1 ? res.rows[0] : undefined;

    if (newMember == null) {
        if (staleCacheData != null) {
            // we update the memberlist here
            const oldMember = JSON.parse(staleCacheData);

            // member list could have changed
            await updateClub(client, oldMember.club);
            await cleanGlobalCaches(oldMember);
        }

        console.log('Removing', key);
        await cacheInstance.delete(key);
    } else {
        if (staleCacheData != null) {
            // we update the memberlist here
            const oldMember = JSON.parse(staleCacheData);
            if (oldMember.club !== newMember.club) {
                await updateClub(client, oldMember.club);
            }
        }

        console.log('Updating', key);
        await cacheInstance.set(key, JSON.stringify(newMember));

        const addresses = [
            newMember.address,
        ];

        if (newMember.companies) {
            for (const company of newMember.companies) {
                addresses.push(company.address);
            }
        }

        const nonEmptyAdresses = addresses.filter((a) => a != null && a !== '');
        if (nonEmptyAdresses.length > 0) {
            const sqs = new xAWS.SQS();
            await sqs.sendMessage({
                QueueUrl: process.env.geocode_queue as string,
                MessageBody: JSON.stringify(addresses),
            }).promise();
        }

        // member list could have changed
        await updateClub(client, newMember.club);
        await cleanGlobalCaches(newMember);
    }
}
