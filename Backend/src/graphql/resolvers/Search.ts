import _ from "lodash";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

type SearchInput = {
    after: string,
    query: {
        text: string,

        roles: string[],
        areas: string[],
        clubs: string[],
    }
}

export const SearchMemberResolver = {
    MemberListView: {
        __resolveType(_obj: any, _context: IApolloContext, _info: any) {
            return "Member";
        },
    },

    Query: {
        SearchMember: async (_root: any, args: SearchInput, context: IApolloContext) => {
            const PAGE_SIZE = 20;

            const cols = [
                "id",

                "pic",

                "firstname",
                "lastname",

                "association",
                "associationname",

                "area",
                "areaname",

                "club",
                "clubname",

                "roles",

                "cursor_lastfirst",
            ];

            const terms = (args.query.text || "")
                .split(' ')
                .map(r => r.trim())
                .filter(r => r != "")
                .map(r => `%${r}%`);

            context.logger.log("Terms", terms, "Args", args);

            const parameters: any[] = [
                PAGE_SIZE + 1,
                parseInt(args.after || "0", 10),
            ];

            const filters = [
                "removed = FALSE",
                "cursor_lastfirst > $2"
            ];

            if (terms.length !== 0) {
                parameters.push(terms);
                filters.push(`
(
        f_unaccent(lastname || ' ' || firstname) ILIKE ALL(array(select f_unaccent(unnest($${parameters.length}::text[]))))
    or  f_unaccent(clubname || ', ' || areaname || ', ' || associationname) ILIKE ALL(array(select f_unaccent(unnest($${parameters.length}::text[]))))
)`
                );
            }

            if (args.query.areas != null && args.query.areas.length > 0) {
                parameters.push(args.query.areas);
                filters.push(`areaname = ANY ($${parameters.length})`);
            }

            if (args.query.clubs != null && args.query.clubs.length > 0) {
                parameters.push(args.query.clubs);
                filters.push(`clubname = ANY ($${parameters.length})`);
            }

            if (args.query.roles != null && args.query.roles.length > 0) {
                parameters.push(args.query.roles);
                filters.push(`id in (select id from structure_tabler_roles where name = ANY ($${parameters.length}))`);
            }

            // if (args.query.areas != null && args.query.areas.length > 0) {
            //     parameters.push(args.query.areas);
            //     filters.push(`areaname = ANY ($${parameters.length})`);
            // }

            return useDatabase(
                context,
                async (client) => {
                    const res = await client.query(`
select  ${cols.join(',')}
from profiles
where
        ${filters.join(' AND ')}
order by cursor_lastfirst
limit $1`,
                        parameters);

                    const end = Math.min(PAGE_SIZE, res.rows.length);
                    context.logger.log("Size", end);

                    return {
                        nodes: res.rows.length > 0 ? _(res.rows).take(end).map(
                            r => ({
                                ...r
                            })
                        ) : [],

                        pageInfo: {
                            endCursor: end >= 1 ? res.rows[end - 1]["cursor_lastfirst"].toString() : "0",
                            hasNextPage: res.rows.length > PAGE_SIZE,
                        }
                    };
                }
            );

        }
    }
}