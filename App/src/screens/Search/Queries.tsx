import gql from 'graphql-tag';

export const AreasQuery = gql`
    query AreasQuery {
        Areas {
            id
            name
        }
    }
`;

export const ClubsQuery = gql`
    query ClubsQuery {
        Clubs {
            id
            name
        }
    }
`;

export const RolesQuery = gql`
    query RolesQuery {
        Roles
    }
`;

export const FiltersQuery = gql`
    query FiltersQuery {
        Areas {
            id
            name
        }

        Clubs {
            id
            name
        }

        Roles
    }
`;

export const LRUQuery = gql`
  query Members($ids: [Int]!) @connection(key: "LRU") {
      Members(ids: $ids) {
          id
          firstname
          lastname
          pic
          club {
              name
          }
      }
  }
`;

export type LRUQueryType = {
    Members: {
        id: number,
        firstname: string,
        lastname: string,
        pic?: string,
        club: {
            name: string,
        }
    }[],
}

export const SearchQuery = gql`
    query Search($text: String!, $after: String, $areas: [String], $roles: [String], $clubs: [String]) {
        SearchMember(query: { text: $text, areas: $areas, roles: $roles, clubs: $clubs }, after: $after) @connection(key: "SearchMember") {
            nodes {
                ... on MemberListView {
                    id
                    pic

                    firstname
                    lastname

                    club {
                        id
                        club
                        name
                    }

                    area {
                        id
                        area
                    }

                    roles {
                        name
                        level
                        group

                        ref {
                            id
                            name
                            type
                        }
                    }
                }
            }

            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`;