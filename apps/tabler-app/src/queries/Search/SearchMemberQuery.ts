import gql from 'graphql-tag';
import { MemberOverviewFragment } from '../Member/MemberOverviewFragment';

export const SearchMemberQuery = gql`
    query SearchMember (
            $text: String!,
            $after: String,
            $families: [ID!],
            $associations: [String!],
            $areas: [String!],
            $roles: [String!],
            $clubs: [String!],
            $sectors: [CompanySector!]
            $availableForChat: Boolean,
        ) {
        SearchMember(query: {
            text: $text,
            families: $families,
            associations: $associations,
            areas: $areas,
            roles: $roles,
            clubs: $clubs,
            sectors: $sectors
            availableForChat: $availableForChat
        }, after: $after) @connection(key: "SearchMember") {
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
