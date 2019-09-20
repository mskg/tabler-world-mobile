import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Channel, ChannelMessage } from './models/Channel';

// tslint:disable-next-line: export-name
export async function handler(event: DynamoDBStreamEvent) {
    for (const subscruptionEvent of event.Records) {
        if (subscruptionEvent.eventName !== 'INSERT' || !subscruptionEvent.dynamodb || !subscruptionEvent.dynamodb.NewImage) {
            console.error('Invalid event. Wrong dynamodb event type, can publish only `INSERT` events to subscribers.', subscruptionEvent);
            continue;
        }

        try {
            const image: ChannelMessage = EXECUTING_OFFLINE
                ? subscruptionEvent.dynamodb.NewImage as ChannelMessage
                : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as ChannelMessage;

            await new Channel(image.channel).publishMessage({
                messages: {
                    ...image,
                },
            });
        } catch (e) {
            console.error(e);
        }
    }
}
