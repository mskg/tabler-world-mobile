
import { ILogger, Metric } from '@mskg/tabler-world-common';
import { LazyPGPool } from '../clients/LazyPGPool';
import { IPooledDataService } from '../types/IPooledDataService';

export async function useDatabasePool<T>(
    context: {
        logger: ILogger,
        metrics?: Metric,
    },
    poolSize: number,
    func: (pool: IPooledDataService) => Promise<T>,
): Promise<T> {

    const pool = new LazyPGPool(poolSize, context.logger, context.metrics);
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
