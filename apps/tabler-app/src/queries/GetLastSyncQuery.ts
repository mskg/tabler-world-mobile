import gql from 'graphql-tag';

export const GetLastSyncQuery = (field) => gql`
    query LastSync {
        LastSync @client {
            ${field}
        }
    }
`;
