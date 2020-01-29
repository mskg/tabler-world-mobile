import { gql } from 'apollo-server-lambda';

export const Jobs = gql`
    scalar JSON

    type Job {
       id: ID!
       runon: Date!
       name: String!
       data: JobResult
       status: JobStatus!
    }

    enum JobStatus {
        running
        completed
        failed
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
