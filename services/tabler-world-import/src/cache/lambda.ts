import { withDatabase } from '@mskg/tabler-world-rds-client';
import { SQSHandler } from 'aws-lambda';
import { CacheUpdateQueueEntry } from '../shared/CacheUpdateQueueEntry';
import { RecordType } from '../shared/RecordType';
import { updateClub } from './updateClub';
import { updateMember } from './updateMember';

// tslint:disable-next-line: export-name
export const handler: SQSHandler = async (event, context, callback) => {

    // max degree 3
    await withDatabase(context, async (client) => {
        for (const message of event.Records) {
            const payload = JSON.parse(message.body) as CacheUpdateQueueEntry;

            if (payload.type === RecordType.club) {
                await updateClub(client, payload.id);

            } else if (payload.type === RecordType.member) {
                await updateMember(client, payload.id);
            }
        }
    });

    callback();
};
