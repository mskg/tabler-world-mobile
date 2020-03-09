import { IEventStorage, QueryOptions } from '../../types/IEventStorage';
import { AnyWebsocketEvent } from '../../types/WebsocketEvent';

export class ServerlessOfflineEventStorage implements IEventStorage {
    constructor(
        private delegate: IEventStorage,
        private publishHandler: (arg: any) => void,
    ) { }

    public get<T, PN>(id: string) {
        return this.delegate.get<T, PN>(id);
    }

    public list<T, PN>(trigger: string, options: QueryOptions) {
        return this.delegate.list<T, PN>(trigger, options);
    }

    public remove(trigger: string, ids: string[]) {
        return this.delegate.remove(trigger, ids);
    }

    public markDelivered(eventName: string, id: string) {
        return this.delegate.markDelivered(eventName, id);
    }

    public async post(events: AnyWebsocketEvent[]): Promise<void> {
        setTimeout(
            () => {
                console.log('************* DEBUG PUBLISH *************');
                this.publishHandler({
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

        await this.delegate.post(events);
    }
}
