import gql from 'graphql-tag';
export const GetClubsMapQuery = gql`
  query ClubsMap ($association: ID) {
        Clubs (association: $association) {
            id
            name
            logo
            clubnumber

            location {
                longitude
                latitude
            }
        }
  }
`;
