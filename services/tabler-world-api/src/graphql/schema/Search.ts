import { gql } from 'apollo-server-lambda';

// tslint:disable-next-line: export-name
export const SearchMember = gql`
    input MemberQueryInput {
        text: String
        availableForChat: Boolean

        sectors: [CompanySector!]
        roles: [String!]

        associations: [String!]
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

    input DirectoryQueryInput {
        text: String
    }

    union SearchDirectoryResult = Association | Area | Club

    type SearchDirectoryConnection {
        nodes: [SearchDirectoryResult!]!
        pageInfo: PageInfo!
    }

    extend type Query {
        SearchMember(query: MemberQueryInput!, after: String): SearchMemberConnection!
        SearchDirectory(query: DirectoryQueryInput!, after: String): SearchDirectoryConnection!
    }
`;
