import { withDatabase } from '@mskg/tabler-world-rds-client';
import { SQSHandler } from 'aws-lambda';
import { CacheUpdateQueueEntry } from '../shared/CacheUpdateQueueEntry';
import { updateClub } from './updateClub';
import { updateMember } from './updateMember';

// tslint:disable-next-line: export-name
export const handler: SQSHandler = async (event, context, callback) => {

    // max degree 3
    await withDatabase(context, async (client) => {
        for (const message of event.Records) {
            const payload = JSON.parse(message.body) as CacheUpdateQueueEntry;

            if (payload.type === 'club') {
                const ids = payload.id.split('_');
                await updateClub(client, ids[0], parseInt(ids[1], 10));

            } else if (payload.type === 'member') {
                await updateMember(client, payload.id);
            }
        }
    });

    callback();
};
