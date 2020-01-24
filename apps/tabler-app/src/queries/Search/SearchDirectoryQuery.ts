import gql from 'graphql-tag';
import { DirectoryFragments } from '../Structure/DirectoryFragments';

export const SearchDirectoryQuery = gql`
    query SearchDirectory (
            $text: String!,
            $after: String
        ) {
        SearchDirectory(query: {
            text: $text
        }, after: $after) @connection(key: "SearchDirectory") {
            nodes {
                __typename
                ...AreaSearchFragment
                ...ClubSearchFragment
                ...AssociationSearchFragment
            }

            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }

    ${DirectoryFragments}
`;
