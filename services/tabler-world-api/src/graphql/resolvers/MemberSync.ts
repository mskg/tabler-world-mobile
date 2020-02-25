import { useDatabase } from '@mskg/tabler-world-rds-client';
import { QueryResult } from 'pg';
import { filter } from '../privacy/filter';
import { IApolloContext } from '../types/IApolloContext';

type MembersArgs = {
    state?: string,
    cursor?: string,
    limit?: number,
};

const MIN = 10;
const DEFAULT = 250000;
const MAX = 500000;
const PREFIX = 'diffTablers:';

const FIELD_MODIFIED = 'modifiedon';
const CURSOR_MODIFIED = 'cursor_modified';

function tryParseInt(val: any, def: number, min?: number, max?: number): number {
    let limit = parseInt(val || def.toString(), 10);
    if (limit == null || isNaN(limit)) { limit = def; }

    if (min != null && max != null) { limit = Math.min(Math.max(limit, min), max); }
    return limit;
}

function decode(val: string | undefined, def: number, min?: number, max?: number): number {
    // tslint:disable-next-line: triple-equals
    if (val == null || val == '') { return def; }
    const buf = Buffer.from(val, 'base64');

    return tryParseInt(buf.toString().replace(PREFIX, ''), def, min, max);
}

function encode(val: any) {
    const buff = Buffer.from(PREFIX + val.toString());
    return buff.toString('base64');
}

// tslint:disable: export-name
// tslint:disable: variable-name
export const MemberSyncResolver = {

    Query: {
        Members: async (_root: any, args: MembersArgs, context: IApolloContext) => {
            return useDatabase(
                context,
                async (client) => {
                    const { cursor, limit: strLimit, state: ts } = args;

                    context.logger.log('diffMembers', 'ts', ts, 'cursor', cursor, 'limit', strLimit);

                    // the ts that we have been given
                    const state: number = decode(ts, new Date(1979, 0, 30).getTime());

                    // page upon given ts
                    const calculatedCursor: number = decode(cursor, 0);

                    const limit = tryParseInt(strLimit, DEFAULT, MIN, MAX);
                    context.logger.log('diffMembers', 'calculatedCursor', calculatedCursor);

                    let res: QueryResult;
                    if (calculatedCursor > 0) {
                        // use index to page
                        res = await client.query(
                            `
                            select * from profiles
                            where ${CURSOR_MODIFIED} >= $1
                            order by ${CURSOR_MODIFIED} asc
                            limit $2`,
                            [calculatedCursor, limit + 1]
                        );

                    } else {
                        // the first time, we query by modified on
                        res = await client.query(
                            `
                            select * from profiles
                            where ${FIELD_MODIFIED} > $1::timestamptz(0)
                            order by ${CURSOR_MODIFIED} asc
                            limit $2`,
                            [new Date(state).toISOString(), limit + 1]
                        );
                    }

                    // no next
                    const metadata = {
                        next_cursor: '',
                    };

                    let stableTs = null;

                    context.logger.log('Found', res.rows.length, 'results');

                    // next for paging
                    if (res.rows.length > limit) {
                        metadata.next_cursor = encode(
                            res.rows[res.rows.length - 1][CURSOR_MODIFIED],
                        );

                        const last = res.rows[res.rows.length - 2][FIELD_MODIFIED];
                        const highest = res.rows[res.rows.length - 1][FIELD_MODIFIED];

                        // we can restart from the next row, no overlaps
                        if (highest > last) {
                            stableTs = encode(last.getTime());
                        }

                        res.rows.splice(-1, 1);
                    } else if (res.rows.length > 0) {
                        // highest time
                        stableTs = encode(res.rows[res.rows.length - 1][FIELD_MODIFIED].getTime());
                    }

                    return {
                        ts: stableTs,
                        tabler: res.rows.map((r) => {
                            if (r.removed === true) {
                                return {
                                    id: r.id,
                                    removed: true,
                                };
                            }

                            return filter(context.principal, r);
                        }),
                        response_metadata: metadata,
                    };
                },
            );
        },
    },
};
