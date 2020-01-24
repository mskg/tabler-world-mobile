import { gql } from 'apollo-server-lambda';

export const Query = gql`
    type Query {
        Me: Member!
        MyRoles: [UserRole!]
    }
`;
