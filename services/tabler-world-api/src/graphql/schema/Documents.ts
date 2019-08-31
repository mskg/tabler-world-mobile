import { gql } from "apollo-server-lambda";

export const Documents = gql`
    type Folder {
        id: Int!
        name: String!

        createdby: Member

        parent: Folder
        children: [DirectoryItem!]
    }

    type File {
        directory: Folder

        id: Int!
        size: Int!

        name: String!
        url: String!

        createdby: Member!
    }

    union DirectoryItem = Folder | File

    extend type Query {
        ListFiles (folder: Int): [DirectoryItem!]
    }
`;
