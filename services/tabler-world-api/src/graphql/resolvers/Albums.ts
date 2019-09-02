import { removeEmptyTags } from '@mskg/tabler-world-common';
import _ from 'lodash';
import { IApolloContext } from '../types/IApolloContext';

type IdQuery = {
    id: number,
};

type TopQuery = {
    top?: number,
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const AlbumsResolver = {
    Query: {
        Albums: async (_root: any, _args: {}, context: IApolloContext) => {
            return _(await context.dataSources.tablerWorld.getAllAlbums())
                .filter((f) => f.pictures && f.pictures.length > 0)
                .orderBy((f) => f.id)
                .reverse()
                .value();
        },

        Album: async (_root: any, args: IdQuery, context: IApolloContext) => {
            const all = await (context.dataSources.tablerWorld.getAllAlbums());
            return all.find((a: any) => a.id == args.id);
        },
    },

    Album: {
        description: (root: any, _args: {}, _context: IApolloContext) => {
            const val = root.description ? root.description.trim() : null;
            if (val == null || val === '') { return null; }

            // this kills empty nodes
            return removeEmptyTags(val);
        },

        pictures: (root: any, args: TopQuery, _context: IApolloContext) => {
            const result = root.pictures
                ? root.pictures.filter((p: any) => p.file && p.file !== '')
                : [];

            if (args.top != null) { return _(result).take(args.top).value(); }
            return result;
        },
    },

    AlbumPicture: {
        preview_60: (root: any, _args: {}, _context: IApolloContext) => {
            return root.file.replace(/\.jpg/, '_60x60.jpg');
        },

        preview_100: (root: any, _args: {}, _context: IApolloContext) => {
            return root.file.replace(/\.jpg/, '_150x100.jpg');
        },

        preview_1920: (root: any, _args: {}, _context: IApolloContext) => {
            return root.file.replace(/\.jpg/, '_1920.jpg');
        },
    },
};
