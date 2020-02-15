import { gql } from 'apollo-server-lambda';

export const Translations = gql`
    extend type Query {
        Languages: [String!]!
        Translations (language: String!): JSON
    }
`;
