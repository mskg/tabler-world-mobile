import { useDatabase } from '@mskg/tabler-world-rds-client';
import _ from 'lodash';
import { FieldNames } from '../privacy/FieldNames';
import { IApolloContext } from '../types/IApolloContext';

type SearchInput = {
    after: string,
    query: {
        text?: string,
        families?: string[],
    },
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const SearchDirectoryResolver = {
    SearchDirectoryResult: {
        __resolveType(obj: any, _context: IApolloContext, _info: any) {
            if (obj.clubnumber) { return 'Club'; }
            if (obj.family) { return 'Association'; }

            return 'Area';
        },
    },

    Query: {
        // tslint:disable-next-line: max-func-body-length
        SearchDirectory: async (_root: any, args: SearchInput, context: IApolloContext) => {
            const PAGE_SIZE = 20;

            const parameters: any[] = [
                PAGE_SIZE + 1,
                parseInt(args.after || '0', 10),
            ];

            const filters = [
                'cursor_name > $2',
            ];

            const terms = (args.query.text || '')
                .split(' ')
                .map((r) => r.trim())
                .filter((r) => r !== '')
                .map((r) => `%${r}%`);

            context.logger.debug('Terms', terms, 'Args', args);

            if (args.query.text && args.query.text.match(/:/)) {
                parameters.push(args.query.text.replace(/\*/, '%'));
                filters.push(`number ilike $${parameters.length}`);
            } else if (terms.length !== 0) {
                terms.forEach((t) => {
                    parameters.push(t);
                    filters.push(`f_unaccent(name) ILIKE f_unaccent($${parameters.length})`);
                });
            }

            const thisMember = await context.dataSources.members.readOne(context.principal.id);
            const allowCross = thisMember[FieldNames.AllFamiliesOptIn] === true;

            if (allowCross) {
                if (args.query.families && args.query.families.length > 0) {
                    parameters.push(args.query.families);
                    filters.push(`family = ANY ($${parameters.length})`);
                }
            } else {
                parameters.push(context.principal.family);
                context.logger.debug('Family search disabled');
                // must match own family
                filters.push(`family = $${parameters.length}`);
            }


            // context.logger.debug("Query is", filters.join(' AND '));

            return useDatabase(
                context,
                async (client) => {
                    const res = await client.query(
                        `select *
from structure_search
where
        ${filters.join(' AND ')}
order by cursor_name
limit $1`,
                        parameters,
                    );

                    const end = Math.min(PAGE_SIZE, res.rows.length);
                    context.logger.debug('Size', end);

                    return {
                        nodes: res.rows.length > 0 ? await Promise.all(_(res.rows).take(end).map(
                            async (row) => {
                                switch (row.type) {
                                    case 'club':
                                        return context.dataSources.structure.getClub(row.id);

                                    case 'area':
                                        return context.dataSources.structure.getArea(row.id);

                                    case 'assoc':
                                        return context.dataSources.structure.getAssociation(row.id);
                                }
                            },
                        ).value()) : [],

                        pageInfo: {
                            endCursor: end >= 1 ? res.rows[end - 1].cursor_name.toString() : '0',
                            hasNextPage: res.rows.length > PAGE_SIZE,
                        },
                    };
                },
            );

        },
    },
};
