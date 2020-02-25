
import { ILogger } from '@mskg/tabler-world-common';
import { LazyPGPool } from '../clients/LazyPGPool';
import { IPooledDataService } from '../types/IPooledDataService';

export async function useDatabasePool<T>(
    context: {
        logger: ILogger,
    },
    poolSize: number,
    func: (pool: IPooledDataService) => Promise<T>,
): Promise<T> {

    const client = new LazyPGPool(context.logger, poolSize);
    try {
        return await func(client);
    } finally {
        try {
            await client.close();
        } catch (e) {
            context.logger.error('[SQL]', 'Failed to close connection', e);
        }
    }
}
