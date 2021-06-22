
import { LazyPGPool } from '../clients/LazyPGPool';
import { IClientOptions } from '../types/IClientOptions';
import { IPooledDataService } from '../types/IPooledDataService';

export async function useDatabasePool<T>(
    context: IClientOptions,
    poolSize: number,
    func: (pool: IPooledDataService) => Promise<T>,
): Promise<T> {

    const pool = new LazyPGPool(poolSize, context.logger, context.sqlLogLevel === 'debug', context.metrics);
    try {
        return await func(pool);
    } finally {
        try {
            await pool.close();
        } catch (e) {
            context.logger.error('[SQL]', 'Failed to close connection', e);
        }
    }
}
