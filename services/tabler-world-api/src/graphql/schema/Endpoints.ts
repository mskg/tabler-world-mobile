import { gql } from 'apollo-server-lambda';

// tslint:disable-next-line: variable-name
export const Endpoints = gql`
    enum EndpointType {
        ios
        android
    }

    input EndpointInput {
        type: EndpointType!
        token: String!
    }

    type Mutation {
        "removes a push token from the authenticated user"
        removeEndpoint(endpoint: EndpointInput!): Boolean

        "adds a token to the store of the authenticated user"
        registerEndpoint(endpoint: EndpointInput!): Boolean
    }
`;
