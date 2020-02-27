import { ConsoleLogger } from '@mskg/tabler-world-common';
import { RedisStorage } from '../../../helper/RedisStorage';
import { IConnection } from '../../types/IConnection';
import { ConnectionDetails, IConnectionStorage } from '../IConnectionStorage';

const logger = new ConsoleLogger('RedisCS');

const makeKey = (connectionId: string) => `ws:connection:${connectionId}`;

export class RedisConnectionStorage implements IConnectionStorage {
    constructor(private client: RedisStorage) {
    }

    public async get(connectionId: string): Promise<IConnection | undefined> {
        logger.log(`[${connectionId}]`, 'get');

        return await this.client.get(makeKey(connectionId));
    }

    public async put(data: ConnectionDetails, ttl: number): Promise<void> {
        logger.log(`[${data.connectionId}]`, 'put', data);

        await this.client.set(
            makeKey(data.connectionId),
            data,
            ttl,
        );
    }

    public async remove(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'disconnect');
        await this.client.del(makeKey(connectionId));
    }
}
