import { gql } from 'apollo-server-lambda';

export const SearchMember = gql`
    input MemberQueryInput {
        text: String

        sectors: [CompanySector!]
        roles: [String!]
        areas: [String!]
        clubs: [String!]
    }

    type PageInfo {
        endCursor: String!
        hasNextPage: Boolean!
    }

    type SearchMemberConnection {
        nodes: [MemberListView!]!
        pageInfo: PageInfo!
    }

    extend type Query {
        SearchMember(query: MemberQueryInput!, after: String): SearchMemberConnection!
    }
`;