
import { Context } from 'aws-lambda';
import { IDataService } from '../types/IDataService';
import { useDatabase } from './useDatabase';

export async function withDatabase<T>(ctx: Context, func: (client: IDataService) => Promise<T>): Promise<T> {
    ctx.callbackWaitsForEmptyEventLoop = false;

    return await useDatabase(
        {
            logger: console,
        },
        func,
    );
}
