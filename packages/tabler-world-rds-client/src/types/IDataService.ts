import { QueryResult, QueryConfig } from 'pg';

export interface IDataService {
    query<T = any, I extends any[] = any[]>(text: string | QueryConfig<I>, parameters?: I): Promise<QueryResult<T>>;
}
