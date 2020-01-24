import { gql } from 'apollo-server-lambda';

// tslint:disable-next-line: variable-name
export const Auth = gql`
    directive @auth(
        requires: UserRole,
    ) on OBJECT | FIELD_DEFINITION

    enum UserRole {
        jobs
    }
`;
