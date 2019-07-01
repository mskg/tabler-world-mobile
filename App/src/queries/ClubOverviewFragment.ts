import gql from 'graphql-tag';

export const ClubOverviewFragment = gql`
    fragment ClubOverviewFragment on Club {
        id
        name
        club
        logo

        area {
            id
            name
            area
        }

        association {
            name
            association
        }
    }
`;
