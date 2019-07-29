import _ from "lodash";
import { IApolloContext } from "../types/IApolloContext";

// type IdQuery = {
//     id: number,
// };

// type TopQuery = {
//     top?: number,
// };

export const DocumentsResolver = {
    Query: {
        ListFiles: async (_root: any, _args: {}, context: IApolloContext) => {


            return _(await context.dataSources.tablerWorld.getAllDocuments())
                .filter(f => f.parent == null && f.files != null && f.files.length > 0)
                // .tap(e => context.logger.log(e))
                .value();
        },
    },


    DirectoryItem: {
        __resolveType: (root: any, _context: IApolloContext) => {
            return root.filename ? "File" : "Folder";
        },
    },

    Folder: {
        createdby: (root: any, _args: {}, context: IApolloContext) => {
            if (root.created_by == null) return null;
            return context.dataSources.members.readOne(root.created_by);
        },

        children: async (root: any, _args: {}, _context: IApolloContext) => {
          //  const all = _(await context.dataSources.tablerWorld.getAllDocuments());

            return [
                // folder
                ...root.children,

                // files
                ...root.files,
            ]
        },
    },

    File: {
        createdby: (root: any, _args: {}, context: IApolloContext) => {
            if (root.uploaded_by_id == null) return null;
            return context.dataSources.members.readOne(root.uploaded_by_id);
        },

        name: (root: any, _args: {}, _context: IApolloContext) => {
            return root.filename;
        },

        url: (root: any, _args: {}, _context: IApolloContext) => {
            return root.file;
        },
    },
}