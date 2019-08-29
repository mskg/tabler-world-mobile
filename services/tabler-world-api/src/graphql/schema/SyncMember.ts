import { gql } from "apollo-server-lambda";

export const SyncMember = gql`
    type ResponseMetadata {
        next_cursor: String!
    }

    type PaggedMemberResult {
        tabler: [Member!]
        ts: String
        response_metadata: ResponseMetadata!
    }
`;
