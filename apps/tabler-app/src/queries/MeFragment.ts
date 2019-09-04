import gql from 'graphql-tag';

export const MeFragment = gql`
    fragment MeFragment on Member {
        id
        pic

        association {
            association
            name
        }

        area {
            id
            area
        }

        club {
            id
            club
            name
        }

        firstname
        lastname
    }
`;
