import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { AsyncPool, ConsoleLogger } from '@mskg/tabler-world-common';
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { groupBy, keys } from 'lodash';
import { Environment } from './Environment';
import { eventManager } from './subscriptions';
import { publishEvent } from './subscriptions/publishEvent';
import { EncodedWebsocketEvent } from './subscriptions/types/EncodedWebsocketEvent';
import { WebsocketEvent } from './subscriptions/types/WebsocketEvent';

const logger = new ConsoleLogger('publish');

async function submit(events: WebsocketEvent<any>[]) {
    for (const event of events) {
        // const evt = await eventManager.getEvent(event.id);
        // if (evt) {
        //     logger.warn('Event', event.id, 'has already been processed.');
        // } else {
        await publishEvent(event);

        if (event.volatile) {
            try {
                await eventManager.remove(event.eventName, [event.id]);
            } catch (e) {
                logger.error('Could not remove messages', event.id, e);
            }
        }
        // }
    }
}

// tslint:disable: max-func-body-length
// tslint:disable-next-line: export-name
export async function handler(event: DynamoDBStreamEvent) {
    const encodedEvents = event.Records.filter((record) => {
        if (record.eventName !== 'INSERT' || !record.dynamodb || !record.dynamodb.NewImage) {
            logger.error('Ignoring event', record.eventName);
            return false;
        }

        return true;
    });

    const events = await AsyncPool<DynamoDBRecord, WebsocketEvent<any> | undefined>(
        Environment.Throtteling.maxParallelDelivery,
        encodedEvents,
        async (subscruptionEvent) => {
            try {
                const encodedImage: EncodedWebsocketEvent = EXECUTING_OFFLINE
                    ? subscruptionEvent.dynamodb!.NewImage as EncodedWebsocketEvent
                    // @ts-ignore
                    : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as EncodedWebsocketEvent;

                return await eventManager.unMarshall<any>(encodedImage);
            } catch (e) {
                logger.error('Could not unmarshal', e, subscruptionEvent);
                return undefined;
            }
        });

    // group by eventName and submit in parallel
    const grouped = groupBy(
        events.filter(Boolean),
        (e: WebsocketEvent<any>) => e.eventName,
    );

    await AsyncPool<string, void>(
        Environment.Throtteling.maxParallelDelivery,
        keys(grouped),
        (eventName) => submit(grouped[eventName] as WebsocketEvent<any>[]),
    );
}
