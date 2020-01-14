import gql from 'graphql-tag';

export const MeFragment = gql`
    fragment MeFragment on Member {
        id
        pic

        association {
            id
            name
        }

        area {
            id
            shortname
            name
        }

        club {
            id
            clubnumber
            name
        }

        firstname
        lastname
    }
`;
