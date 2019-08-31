import { gql } from "apollo-server-lambda";

export const News = gql`
    type NewsArticle {
        id: Int!

        name: String!
        description: String!

        createdby: Member!
        modifiedby: Member

        album: Album
    }

    extend type Query {
        NewsArticle (id: Int!): NewsArticle
        TopNews: [NewsArticle!]
    }
`;
