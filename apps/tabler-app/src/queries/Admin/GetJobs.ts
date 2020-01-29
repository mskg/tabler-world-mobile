import gql from 'graphql-tag';

export const GetJobsQuery = gql`
    query GetJobs {
        Jobs {
            id
            runon
            name
            status

            data {
                __typename
                    ... on JobSync {
                    records
                    readTime
                    refreshTime
                    modified
                }

                ... on JobSend {
                    errors
                    hardFails
                    recipients
                    executionTime
                }

                ... on JobError {
                    error
                }
            }
        }
    }
`;
