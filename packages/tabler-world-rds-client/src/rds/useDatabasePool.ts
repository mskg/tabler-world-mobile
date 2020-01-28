
import { Pool, RDS } from '@mskg/tabler-world-aws';
import { getParameters, Param_Database } from '@mskg/tabler-world-config';
import { QueryArrayConfig, QueryArrayResult, QueryConfig, QueryResult, QueryResultRow, Submittable } from 'pg';
import { ILogger } from './ILogger';

interface PoolApi {
    query<T extends Submittable>(queryStream: T): T;
    // tslint:disable:no-unnecessary-generics
    query<R extends any[] = any[], I extends any[] = any[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>>;
    query<R extends QueryResultRow = any, I extends any[] = any[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>>;
    query<R extends QueryResultRow = any, I extends any[] = any[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>>;
    query<R extends any[] = any[], I extends any[] = any[]>(queryConfig: QueryArrayConfig<I>, callback: (err: Error, result: QueryArrayResult<R>) => void): void;
    query<R extends QueryResultRow = any, I extends any[] = any[]>(queryTextOrConfig: string | QueryConfig<I>, callback: (err: Error, result: QueryResult<R>) => void): void;
    query<R extends QueryResultRow = any, I extends any[] = any[]>(queryText: string, values: I, callback: (err: Error, result: QueryResult<R>) => void): void;
}

// const KEY = "__db";
export async function useDatabasePool<T>(
    context: {
        logger: ILogger, // requestCache: { [key: string]: any }
    },
    poolSize: number,
    func: (pool: PoolApi) => Promise<T>,
): Promise<T> {
    const params = await getParameters('database');
    const connection = JSON.parse(params.database) as Param_Database;

    let password = connection.password;
    // tslint:disable-next-line: possible-timing-attack
    if (password == null || password === '') {
        context.logger.log('[DB]', '-> with token');

        const sign = new RDS.Signer();
        password = sign.getAuthToken({
            region: process.env.AWS_REGION,
            hostname: connection.host,
            port: connection.port || 5432,
            username: connection.user,
        });
    }

    const pool = new Pool({
        host: connection.host,
        port: connection.port || 5432,
        user: connection.user,
        database: connection.database,
        ssl: connection.ssl == null ? true : connection.ssl,

        password,
        max: poolSize,
    });

    try {
        pool.on('error', (...args: any[]) => context.logger.error('[SQL]', ...args));
        pool.on('connect', () => context.logger.log('[DB] connect'));

        return await func(pool);
    } finally {
        try {
            await pool.end();
        } catch (e) {
            context.logger.error('[DB]', 'Failed to close connection', e);
        }
    }
}
