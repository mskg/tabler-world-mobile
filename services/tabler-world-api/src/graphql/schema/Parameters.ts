import { gql } from 'apollo-server-lambda';

export const Parameters = gql`
    scalar ParameterValue

    enum ParameterName {
        geo
        fetch
        urls
        timeouts
    }

    enum ParameterPlatform {
        ios
        android
    }

    type Parameter {
        name: ParameterName!
        value: ParameterValue!
    }

    input ParameterInput {
        version: String!
        os: ParameterPlatform!
    }

    extend type Query {
        getParameters(info: ParameterInput): [Parameter!]
    }
`;
