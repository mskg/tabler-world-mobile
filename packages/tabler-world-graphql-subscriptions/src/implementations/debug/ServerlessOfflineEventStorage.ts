import { EncodedWebsocketEvent } from '../../core/types/EncodedWebsocketEvent';
import { IEventStorage, QueryOptions } from '../../core/types/IEventStorage';
import { SubscriptionServer } from '../../server/SubscriptionServer';

export class ServerlessOfflineEventStorage implements IEventStorage {
    constructor(private context: SubscriptionServer) { }

    public get(id: string) {
        return this.context.config.services.events.get(id);
    }

    public list(trigger: string, options: QueryOptions) {
        return this.context.config.services.events.list(trigger, options);
    }

    public remove(trigger: string, ids: string[]) {
        return this.context.config.services.events.remove(trigger, ids);
    }

    public markDelivered(eventName: string, id: string) {
        return this.context.config.services.events.markDelivered(eventName, id);
    }

    public async post(events: EncodedWebsocketEvent[]): Promise<void> {

        setTimeout(
            () => {
                console.log('************* DEBUG PUBLISHG *************');
                this.context.createPublishHandler()({
                    // @ts-ignore
                    Records: events.map((message) => ({
                        eventName: 'INSERT',
                        dynamodb: {
                            NewImage: message,
                        },
                    })),
                });
            },
            2000,
        );

        await this.context.config.services.events.post(events);
    }
}
