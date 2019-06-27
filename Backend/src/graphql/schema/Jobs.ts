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

    type JobSync {
        records: Int
        readTime: Float
        refreshTime: Float
    }

    type JobSend {
        errors: Int
        hardFails: Int
        recipients: Int
        executionTime: Float
    }

    union JobResult = JobError | JobSync | JobSend

    extend type Query {
        Jobs: [Job!]
    }
`;