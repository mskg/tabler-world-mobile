import { removeEmptySlots } from '@mskg/tabler-world-common';
import { IDataService } from '@mskg/tabler-world-rds-client';
import { RecordType } from '../../shared/RecordType';
import { recordTypeToPrimaryKey } from '../database/recordTypeToPrimaryKey';
import { typeToTable } from '../database/typeToTable';
import { ChangePointer } from '../types/ChangePointer';
import { DataHandler } from '../types/DataHandler';
import { JobType } from '../types/JobType';

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
        const changes: ChangePointer[] = [];

        for (const record of records) {
            // for (const record of records) {
            let recordType: RecordType;

            if (type === JobType.clubs) {
                if (record.level === 2) {
                    recordType = RecordType.area;
                } else if (record.level === 3) {
                    recordType = RecordType.association;
                } else if (record.level === 4) {
                    recordType = RecordType.family;
                } else {
                    recordType = RecordType.club;
                }
            } if (type === JobType.groups) {
                recordType = RecordType.group;
            } else {
                recordType = RecordType.member;
            }

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
                changes.push({ id, type: recordType });
            }
        }

        return changes;
    };
};
