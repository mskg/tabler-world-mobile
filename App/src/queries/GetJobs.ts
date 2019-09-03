import gql from 'graphql-tag';

export const GetJobsQuery = gql`
    query GetJobs {
        Jobs {
            runon
            name
            success

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
