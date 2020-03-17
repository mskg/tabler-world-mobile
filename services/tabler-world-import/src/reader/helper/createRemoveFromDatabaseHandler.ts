import { useDatabasePool } from '@mskg/tabler-world-rds-client';
import { recordTypeToPrimaryKey } from '../database/recordTypeToPrimaryKey';
import { typeToTable } from '../database/typeToTable';
import { ChangePointer } from '../types/ChangePointer';
import { DataHandler } from '../types/DataHandler';
import { JobType } from '../types/JobType';
import { determineRecordType } from './determineRecordType';
import { getConfiguration } from './getConfiguration';

/**
 * Returns a DataHandler that persists the given RecordType in our database.
 * Primary key and table name are chosen based on the givne RecordType
 *
 * @param client The database connection
 * @param type The record type to process
 */
export const createRemoveFromDatabaseHandler = (type: JobType): DataHandler => {

    return async (records: any[]): Promise<ChangePointer[]> => {
        const api = await getConfiguration();

        return useDatabasePool({ logger: console }, api.concurrency.write, async (pool) => {
            console.log('Removing chunk of', records.length, type, 'records');

            const removals = [];

            for (const record of records) {
                const recordType = determineRecordType(type, record);

                // it's also a {id} object
                const pkFunction = recordTypeToPrimaryKey(recordType);
                const id = pkFunction(record);
                const table = typeToTable(recordType);

                console.log('Trying to remove', recordType, id);
                const result = await pool.query(
                    `
DELETE FROM ${table}
WHERE id = $1
`,
                    [id],
                );

                if (result.rowCount === 1) {
                    console.log('Removed', recordType, id);
                    removals.push({ id, type: recordType } as ChangePointer);
                }
            }

            return removals.filter((i) => i != null) as ChangePointer[];
        });
    };
};
