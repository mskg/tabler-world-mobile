import { gql } from "apollo-server-lambda";

export const Query = gql`
    type Query {
        Me: Member!

        MembersOverview: [MemberListView!]!
        # Members(state: String, cursor: String, limit: Int): PaggedMemberResult!

        SearchMember(query: MemberQueryInput!, after: String): SearchMemberConnection!

        Associations: [Association!]
        Clubs: [Club!]
        Areas: [Area!]

        Club (id: String!): Club

        Member (id: Int!): Member
        Members (ids: [Int]!): [Member!]

        Roles: [String!]

        Settings: [Setting!]
        Setting (name: String!): SettingValue
    }
`;
