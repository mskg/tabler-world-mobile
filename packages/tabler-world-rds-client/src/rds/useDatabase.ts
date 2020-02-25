
import { ILogger } from '@mskg/tabler-world-common';
import { LazyPGClient } from '../clients/LazyPGClient';
import { IDataService } from '../types/IDataService';

export async function useDatabase<T>(
    context: {
        logger: ILogger,
    },

    func: (client: IDataService) => Promise<T>,
): Promise<T> {

    const client = new LazyPGClient(context.logger);
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
