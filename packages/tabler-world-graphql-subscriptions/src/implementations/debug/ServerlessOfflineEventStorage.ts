import { WebsocketEvent } from '../../core/types';
import { IEventStorage, QueryOptions } from '../../core/types/IEventStorage';

export class ServerlessOfflineEventStorage implements IEventStorage {
    constructor(
        private delegate: IEventStorage,
        private publishHandler: (arg: any) => void,
    ) { }

    public get<T>(id: string) {
        return this.delegate.get<T>(id);
    }

    public list<T>(trigger: string, options: QueryOptions) {
        return this.delegate.list<T>(trigger, options);
    }

    public remove(trigger: string, ids: string[]) {
        return this.delegate.remove(trigger, ids);
    }

    public markDelivered(eventName: string, id: string) {
        return this.delegate.markDelivered(eventName, id);
    }

    public async post<T>(events: WebsocketEvent<T>[]): Promise<void> {

        setTimeout(
            () => {
                console.log('************* DEBUG PUBLISHG *************');
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

        await this.delegate.post<T>(events);
    }
}
