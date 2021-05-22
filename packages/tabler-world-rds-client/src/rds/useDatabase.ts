
import { LazyPGClient } from '../clients/LazyPGClient';
import { IClientOptions } from '../types/IClientOptions';
import { IDataService } from '../types/IDataService';

export async function useDatabase<T>(
    context: IClientOptions,
    func: (client: IDataService) => Promise<T>,
): Promise<T> {

    const client = new LazyPGClient(context.logger, context.sqlLogLevel === 'debug', context.metrics);
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
