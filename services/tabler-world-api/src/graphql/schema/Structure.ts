
import { gql } from "apollo-server-lambda";

export const Structure = gql`
    type AssociationRole {
        # member: Member!
        member: Member!
        role: String!
    }

    type Association {
        association: String!
        name: String!

        areas: [Area!]!
        board: [AssociationRole!]!
        boardassistants: [AssociationRole!]!
    }

    type Area {
        id: String!

        association: Association!
        area: Int!
        name: String!

        clubs: [Club!]!
        board: [AssociationRole!]!
    }

    type ClubInfo {
        charter_date: Date
        first_meeting: String
        second_meeting: String
        national_godparent: String
        international_godparent: String
    }

    type BankAccount {
        name: String
        owner: String
        iban: String
        bic: String
        currency: String
    }

    type Club {
        id: String!
        association: Association!
        area: Area!

        account: BankAccount

        club: Int!
        name: String!
        logo: String

        meetingplace1: Address
        meetingplace2: Address

        website: String
        instagram: String
        facebook: String
        twitter: String

        email: String
        phone: String

        info: ClubInfo

        board: [AssociationRole!]!
        boardassistants: [AssociationRole!]

        members: [Member!]
    }

    extend type Query {
        Associations: [Association!]
        Clubs: [Club!]
        Areas: [Area!]
        Roles: [String!]

        Club (id: String!): Club
    }
`;
