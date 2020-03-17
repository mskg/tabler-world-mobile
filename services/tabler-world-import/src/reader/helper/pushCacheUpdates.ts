import { SQS } from 'aws-sdk';
import { SendMessageBatchRequestEntry } from 'aws-sdk/clients/sqs';
import _ from 'lodash';
import { CacheUpdateQueueEntry } from '../../shared/CacheUpdateQueueEntry';
import { ChangePointer } from '../types/ChangePointer';

export async function pushCacheUpdates(allModifications: ChangePointer[]) {
    const sqs = new SQS();

    const messages = allModifications.map((cp: ChangePointer) => ({
        Id: `${cp.type}_${cp.id}`,
        MessageBody: JSON.stringify(cp as CacheUpdateQueueEntry),
    }) as SendMessageBatchRequestEntry);

    // 10 is the AWS batch limit
    const messageChunks = _(messages).chunk(10).value();

    for (const chunk of messageChunks) {
        console.log('pushCacheUpdates', chunk.length);
        const sendBatch = await sqs.sendMessageBatch({
            QueueUrl: process.env.sqs_queue as string,
            Entries: chunk,
        }).promise();

        if (sendBatch.Failed && sendBatch.Failed.length > 0) {
            console.error('pushCacheUpdates failed to send', sendBatch.Failed);
        }
    }
}
