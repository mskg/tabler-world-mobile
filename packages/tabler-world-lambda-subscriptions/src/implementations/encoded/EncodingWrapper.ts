import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ITransportEncoder } from '../../types';
import { IEventStorage, PaggedResponse, QueryOptions } from '../../types/IEventStorage';
import { WebsocketEvent } from '../../types/WebsocketEvent';

const logger = new ConsoleLogger('dynamodb');
const EMPTY_RESULT = { result: [] };

export class EncodingWrapper implements IEventStorage {
    constructor(private encoder: ITransportEncoder<any, any, any, any>, private storage: IEventStorage) { }

    public async get(id: string): Promise<WebsocketEvent<any, any> | undefined> {
        const item = await this.storage.get(id);
        return item ? this.encoder.decode(item) : item;
    }

    public async list(trigger: string, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<WebsocketEvent<any, any>>> {
        logger.debug('event', trigger);
        const result = await this.storage.list(trigger, options);

        // @ts-ignore
        return result
            ? {
                nextKey: result.nextKey,
                result: await Promise.all(
                    result.result.map((m) => this.encoder.decode(m)),
                ),
            }
            : EMPTY_RESULT;
    }

    public markDelivered(eventName: string, id: string) {
        return this.storage.markDelivered(eventName, id);
    }


    public async post(events: WebsocketEvent<any, any>[]): Promise<void> {
        await this.storage.post(await Promise.all(
            events.map((m) => this.encoder.encode(m)),
        ));
    }

    public remove(eventName: string, ids: string[]): Promise<void> {
        return this.storage.remove(eventName, ids);
    }
}
