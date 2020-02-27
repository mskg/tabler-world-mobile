import { xAWS } from '@mskg/tabler-world-aws';
import { SendMessageBatchRequestEntry } from 'aws-sdk/clients/sqs';
import { chunk } from 'lodash';
import uuid4 from 'uuid4';
import { Environment } from './Environment';
import { PushNotification } from './PushNotification';

export class PushNotificationService {
    constructor(private url: string = Environment.PUSH_QUEUE) {
    }

    public async send(messages: PushNotification<any>[]) {
        const requests = messages.map((m) => ({
            // tslint:disable-next-line: no-increment-decrement
            Id: uuid4(),
            MessageGroupId: `member:${m.member}`,
            MessageDeduplicationId: uuid4(),

            // service expects an array
            MessageBody: JSON.stringify([m]),
        }) as SendMessageBatchRequestEntry);

        const messageChunks = chunk(requests, 10);
        const sqs = new xAWS.SQS();

        for (const msgChunk of messageChunks) {
            console.log('pushCacheUpdates', msgChunk.length);
            const sendBatch = await sqs.sendMessageBatch({
                QueueUrl: this.url,
                Entries: msgChunk,
            }).promise();

            if (sendBatch.Failed && sendBatch.Failed.length > 0) {
                console.error('pushCacheUpdates failed to send', sendBatch.Failed);
            }
        }
    }
}
