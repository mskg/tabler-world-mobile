import { useDatabase } from '@mskg/tabler-world-rds-client';
import _, { find } from 'lodash';
import { DefaultMemberColumns } from '../dataSources/MembersDataSource';
import { byVersion, v12Check, v14Check } from '../helper/byVersion';
import { SECTOR_MAPPING } from '../helper/Sectors';
import { FieldNames } from '../privacy/FieldNames';
import { IApolloContext } from '../types/IApolloContext';

type SearchInput = {
    after: string,
    query: {
        text: string,
        availableForChat: boolean,

        families: string[],
        associations: string[],
        roles: string[],
        areas: string[],
        clubs: string[],

        sectors: string[],
    },
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const SearchMemberResolver = {
    MemberListView: {
        __resolveType(_obj: any, _context: IApolloContext, _info: any) {
            return 'Member';
        },
    },

    Query: {
        // tslint:disable-next-line: max-func-body-length
        SearchMember: async (_root: any, args: SearchInput, context: IApolloContext) => {
            const PAGE_SIZE = 20;

            const cols = [
                ...DefaultMemberColumns,
                'cursor_lastfirst',
            ];

            const thisMember = await context.dataSources.members.readOne(context.principal.id);
            const allowCross = thisMember[FieldNames.AllFamiliesOptIn] === true;

            const terms = (args.query.text || '')
                .split(' ')
                .map((r) => r.trim())
                .filter((r) => r !== '')
                .map((r) => `%${r}%`);

            context.logger.debug('Terms', terms, 'Args', args);

            const parameters: any[] = [
                PAGE_SIZE + 1,
                parseInt(args.after || '0', 10),
                // context.principal.association,
            ];

            const filters = [
                // 'association = $3',
                'removed = FALSE',
                'cursor_lastfirst > $2',
            ];

            terms.forEach((term) => {
                parameters.push(term);
                filters.push(`
(
        f_unaccent(lastname || ' ' || firstname) ILIKE f_unaccent($${parameters.length})
    or  f_unaccent(areaname || ', ' || associationname) ILIKE f_unaccent($${parameters.length})
    or  f_unaccent(lastname || ' ' || firstname || ', ' || clubname || ', ' || areaname || ', ' || associationname) ILIKE f_unaccent($${parameters.length})
)`);
            });

            if (allowCross) {
                context.logger.debug('Allow cross family search');

                // we got a filter
                if (args.query.families && args.query.families.length > 0) {
                    if (find(args.query.families, context.principal.family) != null) {
                        parameters.push(context.principal.family);
                        parameters.push(args.query.families);

                        filters.push(`(family = $${parameters.length - 1} or (family = ANY ($${parameters.length}) and allfamiliesoptin = true))`);
                    } else {
                        parameters.push(args.query.families);
                        filters.push(`(family = ANY ($${parameters.length}) and allfamiliesoptin = true)`);
                    }
                } else {
                    // all those that opted in or his own family
                    parameters.push(context.principal.family);
                    filters.push(`(family = $${parameters.length} or allfamiliesoptin = true)`);
                }

            } else {
                parameters.push(context.principal.family);
                context.logger.debug('Family search disabled');
                // must match own family
                filters.push(`family = $${parameters.length}`);
            }

            // old only 'de
            byVersion({
                context,
                mapVersion: v12Check,

                versions: {
                    // only
                    old: () => {
                        parameters.push(context.principal.association);
                        filters.push(`association = $${parameters.length}`);
                    },

                    default: () => {
                        if (args.query.associations != null && args.query.associations.length > 0) {
                            parameters.push(args.query.associations);
                            filters.push(`association = ANY ($${parameters.length})`);
                        }
                    },
                },
            });

            if (args.query.areas != null && args.query.areas.length > 0) {
                parameters.push(args.query.areas);

                byVersion({
                    context,
                    mapVersion: v14Check,

                    versions: {
                        old: () => {
                            filters.push(`areaname = ANY ($${parameters.length})`);
                        },

                        default: () => {
                            filters.push(`area = ANY ($${parameters.length})`);
                        },
                    },
                });
            }

            if (args.query.clubs != null && args.query.clubs.length > 0) {
                parameters.push(args.query.clubs);

                byVersion({
                    context,
                    mapVersion: v14Check,

                    versions: {
                        old: () => {
                            filters.push(`clubname = ANY ($${parameters.length})`);
                        },

                        default: () => {
                            filters.push(`club = ANY ($${parameters.length})`);
                        },
                    },
                });
            }

            if (args.query.roles != null && args.query.roles.length > 0) {
                parameters.push(args.query.roles);
                filters.push(`id in (select id from structure_tabler_roles where functionname = ANY ($${parameters.length}))`);
            }

            if (args.query.sectors != null && args.query.sectors.length > 0) {
                parameters.push(args.query.sectors.map((s) => (JSON.stringify([{ sector: SECTOR_MAPPING[s] }]))));
                const sectorsId = parameters.length;

                parameters.push(context.principal.id);
                parameters.push(context.principal.club);
                parameters.push(context.principal.association);
                parameters.push(context.principal.family);

                filters.push(`id in (
select sectorprofiles.id
from profiles sectorprofiles, profiles_privacysettings sectorpricacy
where
        sectorprofiles.id = sectorpricacy.id
    and sectorprofiles.removed = false
    and get_profile_access(sectorpricacy.company,
        sectorprofiles.id, sectorprofiles.club, sectorprofiles.association, sectorprofiles.family, sectorprofiles.allfamiliesoptin,
        $${sectorsId + 1}, $${sectorsId + 2}, $${sectorsId + 3}, $${sectorsId + 4}
    ) = true
    and sectorprofiles.companies @> ANY($${sectorsId}::jsonb[])
)`);
            }

            // we need some chat partners
            if (args.query.availableForChat) {
                parameters.push(context.principal.id);
                filters.push(
                    `id in (
select
    id
from
    usersettings
where
        id <> $${parameters.length}
    and (
            settings->'notifications'->>'personalChat' is null
        or  settings->'notifications'->>'personalChat' = 'true'
    )
    and array_length(tokens, 1) > 0
)`,
                );
            }


            // context.logger.debug("Query is", filters.join(' AND '));

            return useDatabase(
                context,
                async (client) => {
                    const res = await client.query(
                        `select  ${cols.join(',')}
from profiles
where
        ${filters.join(' AND ')}
order by cursor_lastfirst
limit $1`,
                        parameters,
                    );

                    const end = Math.min(PAGE_SIZE, res.rows.length);
                    context.logger.debug('Size', end);

                    return {
                        nodes: res.rows.length > 0 ? _(res.rows).take(end).map(
                            (r) => ({
                                ...r,
                            }),
                        ) : [],

                        pageInfo: {
                            endCursor: end >= 1 ? res.rows[end - 1].cursor_lastfirst.toString() : '0',
                            hasNextPage: res.rows.length > PAGE_SIZE,
                        },
                    };
                },
            );

        },
    },
};
