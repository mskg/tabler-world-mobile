
import { IDataService } from '../types/IDataService';

export async function withTransaction<T>(client: IDataService, func: () => Promise<T>): Promise<T> {
    try {
        await client.query('BEGIN');
        const result = await func();
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
}
