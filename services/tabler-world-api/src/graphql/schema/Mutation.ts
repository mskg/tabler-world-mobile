import { gql } from 'apollo-server-lambda';

export const Mutation = gql`
    type Mutation {
        "removes a push token from the authenticated user"
        removeToken(token: String!): Boolean

        "adds a token to the store of the authenticated user"
        addToken(token: String!): Boolean
    }
`;
