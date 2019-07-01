import gql from 'graphql-tag';
import { MemberOverviewFragment } from "./MemberOverviewFragment";

export const SearchMemberQuery = gql`
    query SearchMember ($text: String!, $after: String, $areas: [String!], $roles: [String!], $clubs: [String!]) {
        SearchMember(query: { text: $text, areas: $areas, roles: $roles, clubs: $clubs }, after: $after) @connection(key: "SearchMember") {
            nodes {
                ...MemberOverviewFragment
            }

            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }

    ${MemberOverviewFragment}
`;
