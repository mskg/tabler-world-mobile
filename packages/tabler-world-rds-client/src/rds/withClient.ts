
import { Context } from 'aws-lambda';
import { IDataService } from './IDataService';
import { useDataService } from './useDataService';

export async function withClient<T>(ctx: Context, func: (client: IDataService) => Promise<T>): Promise<T> {
    ctx.callbackWaitsForEmptyEventLoop = false;

    return await useDataService(
        {
            logger: console,
        },
        func,
    );
}
