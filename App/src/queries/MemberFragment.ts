import gql from 'graphql-tag';

export const MemberFragment = gql`
    fragment MemberFragment on Member {
        id
        pic
        firstname
        lastname
    }
`;
