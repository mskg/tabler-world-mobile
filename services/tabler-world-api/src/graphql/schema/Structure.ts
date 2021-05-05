
import { gql } from 'apollo-server-lambda';

// tslint:disable-next-line: export-name
export const Structure = gql`
    type AssociationRole {
        # member: Member!
        member: Member!
        role: String!
    }

    type Family {
        id: ID!
        name: String!
        logo: String

        associations: [Association!]!
        board: [AssociationRole!]!
        boardassistants: [AssociationRole!]!
        regionalboard: [AssociationRole!]!
    }

    type Association {
        id: ID!
        family: Family!

        logo: String
        flag: String
        isocode: String!

        name: String!
        shortname: String!

        areas: [Area!]!
        board: [AssociationRole!]!
        boardassistants: [AssociationRole!]!
    }

    type Area {
        id: ID!
        association: Association!

        name: String!
        shortname: String!

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
        id: ID!

        area: Area!
        association: Association!
        family: Family!

        account: BankAccount

        clubnumber: Int!
        name: String!
        shortname: String!

        logo: String

        meetingplace1: Address
        meetingplace2: Address

        website: String
        instagram: String
        facebook: String
        twitter: String
        linkedin: String

        email: String
        phone: String

        info: ClubInfo

        board: [AssociationRole!]!
        boardassistants: [AssociationRole!]!
        members: [Member!]!
    }

    extend type Query {
        Families: [Family!]
        Family (id: ID): Family

        "Giving no id returns own organization"
        Association (id: ID): Association
        Associations (family: ID): [Association!]

        # this is a wrong signature, needs to be changed to ID
        Club (id: String!): Club

        "Giving no id returns own organization"
        Clubs (association: ID): [Club!]

        Area (id: ID!): [Area!]

        "Giving no id returns own organization"
        Areas (association: ID): [Area!]

        "Giving no id returns own family"
        Roles (family: ID): [String!]
    }
`;
