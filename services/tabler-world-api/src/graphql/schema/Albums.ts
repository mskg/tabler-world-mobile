import { gql } from "apollo-server-lambda";

export const Albums = gql`
    type Album {
        id: Int!

        name: String!
        description: String

        pictures (top: Int): [AlbumPicture!]!
    }

    type AlbumPicture {
        id: Int!
        width: Int!
        height: Int!

        file: String!

        preview_60: String!
        preview_100: String!
        preview_1920: String!
    }

    extend type Query {
        Albums: [Album!]!
        Album (id: Int!): Album
    }
`;
