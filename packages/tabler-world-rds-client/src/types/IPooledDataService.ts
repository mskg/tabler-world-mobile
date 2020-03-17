import { QueryArrayConfig, QueryArrayResult, QueryConfig, QueryResult, QueryResultRow, Submittable } from 'pg';
import { IDataService } from './IDataService';
export interface IPooledDataService extends IDataService {
    query<T extends Submittable>(queryStream: T): T;
    // tslint:disable:no-unnecessary-generics
    query<R extends any[] = any[], I extends any[] = any[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>>;
    query<R extends QueryResultRow = any, I extends any[] = any[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>>;
    query<R extends QueryResultRow = any, I extends any[] = any[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>>;
}
