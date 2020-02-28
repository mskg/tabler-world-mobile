
import { ILogger, Metric } from '@mskg/tabler-world-common';
import { LambdaClient } from '../clients/LambdaClient';
import { IDataService } from '../types/IDataService';

export function useDataService<T>(
    context: { logger: ILogger, metrics?: Metric },
    func: (client: IDataService) => Promise<T>,
): Promise<T> {
    return func(new LambdaClient(context.logger, context.metrics));
}
