
import { gql } from 'apollo-server-lambda';

// tslint:disable-next-line: variable-name
export const Deprecated = gql`
    extend type Association {
        "Deprecated, don't use"
        association: String!
    }

    extend type Area {
        "Deprecated, don't use"
        area: Int!
    }

    extend type Club {
        "Deprecated, don't use"
        club: Int!
    }
`;
