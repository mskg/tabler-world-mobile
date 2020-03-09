import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { AsyncPool, ConsoleLogger } from '@mskg/tabler-world-common';
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { groupBy, keys } from 'lodash';
import { WebsocketEvent } from '../types/WebsocketEvent';
import { Environment } from '../server/Environment';
import { SubscriptionServerContext } from '../server/SubscriptionServerContext';
import { publishEvent } from './publishEvent';

const logger = new ConsoleLogger('publish');

export function createPublishMessageLambda(context: SubscriptionServerContext<any, any>) {

    async function submit(events: WebsocketEvent<any>[]) {
        for (const event of events) {
            // const evt = await eventManager.getEvent(event.id);
            // if (evt) {
            //     logger.warn('Event', event.id, 'has already been processed.');
            // } else {
            await publishEvent(context, event);

            if (event.volatile) {
                try {
                    await context.eventStorage.remove(event.eventName, [event.id]);
                } catch (e) {
                    logger.error('Could not remove messages', event.id, e);
                }
            }
            // }
        }
    }

    return async (event: DynamoDBStreamEvent) => {
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
                    const encodedImage: WebsocketEvent<any> = EXECUTING_OFFLINE
                        ? subscruptionEvent.dynamodb!.NewImage as WebsocketEvent<any>
                        // @ts-ignore
                        : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as EncodedWebsocketEvent;

                    return await context.encoder.decode(encodedImage);
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
    };
}

