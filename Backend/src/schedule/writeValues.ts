import { Client } from 'pg';
import { removeEmpty } from './removeEmpty';
import { Types } from './types';

export const writeValues = (client: Client, type: Types) => {
    return async (data: Array<any>) => {
        console.log("Writing chunk of", data.length, "records");
        const results: any[] = [];

        for (let r of data) {
            const id = r.id || r.subdomain;
            console.log(id);

            const result = await client.query(`
INSERT INTO ${type}(id, data, modifiedon)
VALUES($1, $2, now())
ON CONFLICT (id)
DO UPDATE
  SET data = excluded.data, modifiedon = excluded.modifiedon
  WHERE ${type}.data::text <> excluded.data::text
`, [id, JSON.stringify(removeEmpty(r))]);

            if (result.rowCount == 1) {
                console.log(id, "modified");
                results.push(id);
            }
        }

        return results;
    };
};
