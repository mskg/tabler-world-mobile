import { QueryResult } from 'pg';

export interface IDataService {
    query(text: string, values?: any[]): Promise<QueryResult>;
}
