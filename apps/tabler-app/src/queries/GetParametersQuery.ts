import gql from 'graphql-tag';

export const GetParametersQuery = gql`
    query GetParameters ($info: ParameterInput!) {
        getParameters (info: $info) {
            name
            value
        }
    }
`;
