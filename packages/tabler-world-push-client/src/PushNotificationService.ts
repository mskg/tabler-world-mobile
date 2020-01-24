import { xAWS } from '@mskg/tabler-world-aws';
import { PushNotification } from './PushNotification';

export class PushNotificationService {
    constructor(private url: string = process.env.PUSH_QUEUE as string) {
    }

    public async send(messages: PushNotification<any>[]) {
        const sqs = new xAWS.SQS();
        await sqs.sendMessage({
            QueueUrl: this.url,
            MessageBody: JSON.stringify(messages),
        }).promise();
    }
}
