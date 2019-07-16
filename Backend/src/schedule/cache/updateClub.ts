import { Client } from "pg";
import { makeCacheKey } from "../../graphql/cache/makeCacheKey";
import { cache } from "./cacheInstance";

// we keep an im memory hash of the last updated clubs
// the lambda is short lived, with a max degree of three
// this should prevent (some) duplicate/unnecessary updates
const updated: {
    [key: string]: number,
} = {};

const MINUTES_5 = 5 * 60 /* s */ * 1000 /* ms */;

export async function updateClub(client: Client, assoc: string, club: number) {
    const key = makeCacheKey("Club", [assoc + "_" + club]);

    if (updated[key] != null && Date.now() - updated[key] < MINUTES_5) {
        return;
    }

    const res = await client.query(
        `select * from structure_clubs where association = $1 and club = $2`,
        [assoc, club]);

    const newClub = res.rows.length == 1 ? res.rows[0] : undefined;

    updated[key] = Date.now();

    if (newClub != null) {
        console.log("Updating", key);
        cache.set(key, JSON.stringify(newClub));
    }
    else {
        console.log("Removing", key);
        cache.delete(key);
    }
}
