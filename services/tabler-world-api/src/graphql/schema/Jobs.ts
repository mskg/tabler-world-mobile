import { gql } from 'apollo-server-lambda';

export const Jobs = gql`
    scalar JSON

    type Job {
       runon: Date!
       name: String!
       success: Boolean!
       data: JobResult
    }

    type JobError {
        error: JSON
    }

    type JobEmpty {
        empty: Boolean
    }

    type JobSync {
        records: Int
        modified: Int
        readTime: Float
        refreshTime: Float
    }

    type JobSend {
        errors: Int
        hardFails: Int
        recipients: Int
        executionTime: Float
    }

    union JobResult = JobError | JobSync | JobSend | JobEmpty

    extend type Query {
        Jobs: [Job!] @auth(requires: jobs)
    }
`;
