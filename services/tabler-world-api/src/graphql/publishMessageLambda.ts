import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { groupBy, keys } from 'lodash';
import { eventManager } from './subscriptions';
import { publishEvent } from './subscriptions/publishEvent';
import { EncodedWebsocketEvent } from './subscriptions/types/EncodedWebsocketEvent';
import { WebsocketEvent } from './subscriptions/types/WebsocketEvent';

const logger = new ConsoleLogger('publish');

async function submit(events: WebsocketEvent<any>[]) {
    for (const event of events) {
        // this will not fail
        await publishEvent(event);
    }

    const volatiles = events.filter((e) => e.volatile).map((e) => e.id);
    try {
        if (volatiles && volatiles.length > 0) {
            await eventManager.remove(events[0].eventName, volatiles);
        }
    } catch (e) {
        logger.error('Could not remove messages', volatiles, e);
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

    // unmarshall everything
    const events = await Promise.all(
        encodedEvents.map((subscruptionEvent) => {
            try {
                const encodedImage: EncodedWebsocketEvent = EXECUTING_OFFLINE
                    ? subscruptionEvent.dynamodb!.NewImage as EncodedWebsocketEvent
                    // @ts-ignore
                    : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as EncodedWebsocketEvent;

                return eventManager.unMarshall<any>(encodedImage);
            } catch (e) {
                logger.error('Could not unmarshal', e, subscruptionEvent);
                return null;
            }
        }),
    );

    // group by eventName and submit in parallel
    const grouped = groupBy(events.filter(Boolean), (e: WebsocketEvent<any>) => e.eventName);
    await Promise.all(
        keys(grouped).map(
            (eventName) => submit(grouped[eventName] as WebsocketEvent<any>[]),
        ),
    );
}
