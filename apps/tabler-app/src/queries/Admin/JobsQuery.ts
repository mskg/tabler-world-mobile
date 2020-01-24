
import gql from 'graphql-tag';

export const JobsQuery = gql`
query Jobs {
    Jobs {
      runon
      name
      success
      data {
        __typename
        ... on JobError {
          error
        }

        ... on JobSync {
          records
          readTime
          refreshTime
        }

        ... on JobSend {
          recipients
          errors
          hardFails
          recipients
          executionTime
        }
      }
    }
  }
`;
