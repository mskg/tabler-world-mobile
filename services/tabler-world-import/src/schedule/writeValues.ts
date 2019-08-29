import { removeEmptySlots } from '@mskg/tabler-world-common';
import { IDataService } from '@mskg/tabler-world-rds-client';
import { Types } from './types';

const clubPK = (c: any) => c["subdomain"].replace(/[^a-z]/ig, "") + "_" + c["subdomain"].replace(/[^0-9]/ig, "");
const memberPK = (c: any) => c["id"];

export type ChangePointer = {
    id: string | number,
    type: Types,
};

export const writeValues = (client: IDataService, type: Types) => {
    const pk = type === Types.clubs ? clubPK : memberPK;

    return async (data: Array<any>): Promise<ChangePointer[]> => {
        console.log("Writing chunk of", data.length, type, "records");

        const results: any[] = [];

        for (let r of data) {
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