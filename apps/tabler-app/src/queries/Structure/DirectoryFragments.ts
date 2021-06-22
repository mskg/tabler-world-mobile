import gql from 'graphql-tag';

export const DirectoryFragments = gql`
    fragment AreaSearchFragment on Area {
      name
      id
      shortname

      association {
        id
        name
        flag

        family {
          id
          name
          shortname
        }
      }
    }

    fragment ClubSearchFragment on Club {
      id
      name
      logo
      clubnumber

      association {
        id
        name
        flag
      }

      area {
        id
        name
      }

      family {
        id
        name
        shortname
      }
    }

    fragment AssociationSearchFragment on Association {
      name
      id
      logo
      shortname
      flag

      family {
        id
        name
        shortname
      }
    }
`;
