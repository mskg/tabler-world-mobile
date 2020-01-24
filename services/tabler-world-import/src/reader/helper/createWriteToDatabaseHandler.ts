import { removeEmptySlots } from '@mskg/tabler-world-common';
import { IDataService } from '@mskg/tabler-world-rds-client';
import { recordTypeToPrimaryKey } from '../database/recordTypeToPrimaryKey';
import { typeToTable } from '../database/typeToTable';
import { ChangePointer } from '../types/ChangePointer';
import { DataHandler } from '../types/DataHandler';
import { JobType } from '../types/JobType';
import { determineRecordType } from './determineRecordType';

/**
 * Returns a DataHandler that persists the given RecordType in our database.
 * Primary key and table name are chosen based on the givne RecordType
 *
 * @param client The database connection
 * @param type The record type to process
 */
export const createWriteToDatabaseHandler = (client: IDataService, type: JobType): DataHandler => {
    return async (records: any[]): Promise<ChangePointer[]> => {
        console.log('Writing chunk of', records.length, type, 'records');

        const inserts = await Promise.all(records.map(async (record) => {
            const recordType = determineRecordType(type, record);
            const pkFunction = recordTypeToPrimaryKey(recordType);
            const id = pkFunction(record);
            const table = typeToTable(recordType);

            console.log(recordType, id);

            const result = await client.query(
                `
INSERT INTO ${table}(id, data, modifiedon)
VALUES($1, $2, now())
ON CONFLICT (id)
DO UPDATE
  SET data = excluded.data, modifiedon = excluded.modifiedon
  WHERE ${table}.data::text <> excluded.data::text
`,
                [id, JSON.stringify(removeEmptySlots(record))],
            );

            if (result.rowCount === 1) {
                console.log(id, 'modified');
                return { id, type: recordType } as ChangePointer;
            }

            return null;
        }));

        return inserts.filter((i) => i != null) as ChangePointer[];
    };
};
