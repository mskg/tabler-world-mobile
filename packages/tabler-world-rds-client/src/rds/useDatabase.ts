
import { ILogger, Metric } from '@mskg/tabler-world-common';
import { LazyPGClient } from '../clients/LazyPGClient';
import { IDataService } from '../types/IDataService';

export async function useDatabase<T>(
    context: {
        logger: ILogger,
        metrics?: Metric,
    },

    func: (client: IDataService) => Promise<T>,
): Promise<T> {

    const client = new LazyPGClient(context.logger, context.metrics);
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
