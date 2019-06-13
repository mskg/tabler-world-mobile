import { Client } from 'pg';
import { removeEmpty } from './removeEmpty';
import { Types } from './types';

export const writeValues = (client: Client, type: Types) => {
    return async (data: Array<any>) => {
        console.log("Writing chunk of", data.length, "records");

        for (let r of data) {
            console.log(r.id || r.subdomain);
            await client.query(`
INSERT INTO ${type}(id, data, modifiedon)
VALUES($1, $2, now())
ON CONFLICT (id)
DO UPDATE
  SET data = excluded.data, modifiedon = excluded.modifiedon
  WHERE ${type}.data::text <> excluded.data::text
`, [r.id || r.subdomain, JSON.stringify(removeEmpty(r))]);
        }
    };
};
