import gql from 'graphql-tag';

export const GetClubsMapQuery = gql`
  query ClubsMap {
    Clubs {
      id
      name
      logo
      club

      location {
        longitude
        latitude
      }
    }
  }
`;
