import gql from 'graphql-tag';

export const MemberAvatarFragment = gql`
    fragment MemberAvatarFragment on Member {
        id
        firstname
        lastname
        pic

        club {
            id
            name
        }

        area {
            id
            name
        }

        association {
            id
            name
            flag
        }

        family {
            id
            name
            shortname
        }
    }
`;
