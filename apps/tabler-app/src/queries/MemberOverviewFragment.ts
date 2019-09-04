import gql from 'graphql-tag';

export const MemberOverviewFragment = gql`
    fragment MemberOverviewFragment on Member {
        id
        pic

        firstname
        lastname

        club {
           id
           name
           club
       }

       area {
           id
           name
       }

       association {
            association
            name
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
`;
