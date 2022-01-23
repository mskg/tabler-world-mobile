
import { LambdaClient } from '../clients/LambdaClient';
import { IClientOptions } from '../types/IClientOptions';
import { IDataService } from '../types/IDataService';

export function useDataService<T>(
    context: IClientOptions,
    func: (client: IDataService) => Promise<T>,
): Promise<T> {
    return func(new LambdaClient(
        context.logger,
        context.sqlLogLevel === 'debug',
        context.metrics,
    ));
}
