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
           clubnumber
       }

       area {
           id
           name
       }

       association {
            id
            name
       }

        roles {
            name
            level
            group

            ref {
                id
                shortname
                type
            }
        }
    }
`;
