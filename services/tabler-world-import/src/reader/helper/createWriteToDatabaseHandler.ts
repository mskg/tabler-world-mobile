import { removeEmptySlots } from '@mskg/tabler-world-common';
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
export const createWriteToDatabaseHandler = (type: JobType): DataHandler => {

    return async (records: any[]): Promise<ChangePointer[]> => {
        const api = await getConfiguration();

        return useDatabasePool({ logger: console }, api.concurrency.write, async (pool) => {
            console.log('Writing chunk of', records.length, type, 'records');

            const inserts = [];

            for (const record of records) {
                const recordType = determineRecordType(type, record);
                const pkFunction = recordTypeToPrimaryKey(recordType);
                const id = pkFunction(record);
                const table = typeToTable(recordType);

                console.log('Trying to update', recordType, id);
                const result = await pool.query(
                    `
INSERT INTO ${table}(id, data, modifiedon, lastseen)
VALUES($1, $2, now(), now())
ON CONFLICT (id)
DO UPDATE
  SET
    data = excluded.data,
    modifiedon = case
        when ${table}.data is null then excluded.modifiedon
        when ${table}.data::text <> excluded.data::text then excluded.modifiedon
        else ${table}.modifiedon
    end,
    lastseen = excluded.lastseen
RETURNING modifiedon, lastseen
`,
                    [id, JSON.stringify(removeEmptySlots(record))],
                );

                // if they are identical, the row has been modified
                // They do not equal without conversion to String?
                if (String(result.rows[0].modifiedon) === String(result.rows[0].lastseen)) {
                    console.log('Changed', recordType, id);
                    inserts.push({ id, type: recordType } as ChangePointer);
                }
            }

            return inserts.filter((i) => i != null) as ChangePointer[];
        });
    };
};
