import { removeEmptySlots } from "@mskg/tabler-world-common";
import { IDataService } from "@mskg/tabler-world-rds-client";
import { ChangePointer } from "../types/ChangePointer";
import { DataHandler } from "../types/DataHandler";
import { RecordType } from "../types/RecordType";

// we create a string association_clubnumber that is unique and allows us to target records directly
const clubPK = (c: any) => c.subdomain.replace(/[^a-z]/ig, "") + "_" + c.subdomain.replace(/[^0-9]/ig, "");

// members have a unique id
const memberPK = (c: any) => c.id;

/**
 * Returns a DataHandler that persists the given RecordType in our database.
 * Primary key and table name are chosen based on the givne RecordType
 *
 * @param client The database connection
 * @param type The record type to process
 */
export const createWriteToDatabaseHandler = (client: IDataService, type: RecordType): DataHandler => {
    const pk = type === RecordType.clubs ? clubPK : memberPK;

    return async (data: any[]): Promise<ChangePointer[]> => {
        console.log("Writing chunk of", data.length, type, "records");

        const results: any[] = [];

        for (const r of data) {
            const id = pk(r);
            console.log(id);

            const result = await client.query(`
INSERT INTO ${type}(id, data, modifiedon)
VALUES($1, $2, now())
ON CONFLICT (id)
DO UPDATE
  SET data = excluded.data, modifiedon = excluded.modifiedon
  WHERE ${type}.data::text <> excluded.data::text
`, [id, JSON.stringify(removeEmptySlots(r))]);

            if (result.rowCount == 1) {
                console.log(id, "modified");
                results.push({ id, type });
            }
        }

        return results;
    };
};
