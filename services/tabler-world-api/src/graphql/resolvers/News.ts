import { removeEmptyTags } from '@mskg/tabler-world-common';
import _ from 'lodash';
import { IApolloContext } from '../types/IApolloContext';

type IdQuery = {
    id: number,
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const NewsResolver = {
    Query: {
        NewsArticle: async (_root: any, args: IdQuery, context: IApolloContext) => {
            return _(await context.dataSources.tablerWorld.getAllNews())
                .filter((f) => f.id === args.id)
                .filter((f) => f.is_published === true)
                .filter((f) => f.is_published_start_date == null || Date.now() > new Date(f.is_published_start_date).getTime())
                .filter((f) => f.is_published_end_date == null || Date.now() < new Date(f.is_published_end_date).getTime())
                .first();
        },

        TopNews: async (_root: any, _args: {}, context: IApolloContext) => {
            return _(await context.dataSources.tablerWorld.getAllNews())
                .filter((f) => f.is_published === true)
                .filter((f) => f.is_published_start_date == null || Date.now() > new Date(f.is_published_start_date).getTime())
                .filter((f) => f.is_published_end_date == null || Date.now() < new Date(f.is_published_end_date).getTime())
                .orderBy((f) => f.id * - 1)
                // .tap(e => context.logger.debug(e))
                .value();
        },
    },

    NewsArticle: {
        album: async (root: any, _args: {}, context: IApolloContext) => {
            const val = root.album_id ? root.album_id : null;
            if (val == null || val === '') { return null; }

            const all = await (context.dataSources.tablerWorld.getAllAlbums());
            return all.find((a: any) => a.id === val);
        },

        description: (root: any, _args: {}, _context: IApolloContext) => {
            const val = root.content ? root.content.trim() : null;
            if (val == null || val === '') { return null; }

            // this kills empty nodes
            return removeEmptyTags(val);
        },

        createdby: (root: any, _args: {}, context: IApolloContext) => {
            if (root.author_id == null) { return null; }
            return context.dataSources.members.readOneManyWithAnyStatus(root.author_id);
        },

        modifiedby: (root: any, _args: {}, context: IApolloContext) => {
            if (root.last_modified_by_id == null) { return null; }
            return context.dataSources.members.readOneManyWithAnyStatus(root.last_modified_by_id);
        },

    },
};
