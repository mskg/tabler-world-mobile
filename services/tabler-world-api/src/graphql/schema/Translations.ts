import { gql } from 'apollo-server-lambda';

export const Translations = gql`
    extend type Query {
        Languages: [String!]! @auth(requires: i18n)
        Translations (language: String!): JSON @auth(requires: i18n)
    }
`;
