import { gql } from 'apollo-server-lambda';

export const Member = gql`
    type Address {
        id: Int,
        address_type: Int
        city: String
        country: String
        region: String
        postal_code: String
        street1: String
        street2: String
    }

    enum CompanySector {
        accountingauditing
        administrativesupportservices
        advertisingmarketingpublicrelations
        aerospaceaviation
        agricultureforestryfishing
        architecturalservices
        artsentertainmentmedia
        banking
        biotechnologypharmaceutical
        communitysocialservicesnonprofit
        constructiontradesmining
        consultingservices
        customerservicecallcenter
        design
        educationtraininglibrary
        employmentrecruitmentagency
        engineering
        financeeconomics
        governmentpolicy
        healthsocialcarepractitionertechnician
        hospitalitytourism
        humanresources
        industry
        informationtechnology
        installationmaintenancerepair
        insurance
        lawenforcementsecurity
        legal
        manufacturingproduction
        other
        personalcare
        realestate
        restaurantfoodservice
        retailwholesale
        sales
        scienceresearch
        telecommunications
        voluntaryservices
        warehousingdistribution
    }

    type Company {
        name: String!
        email: String
        phone: String
        sector: CompanySector
        function: String
        begin_date: Date
        end_date: Date
        address: Address
    }

    type Education {
        school: String
        education: String
        address: Address
    }

    enum RoleType {
        club
        area
        assoc
        family

        "not yet existing"
        region

        "deprecated"
        rti
    }

    type RoleRef {
        id: String!
        name: String!
        shortname: String!
        type: RoleType!
    }

    type Role {
        name: String!
        level: String!
        group: String!
        ref: RoleRef!
    }

    type CommunicationElement {
        type: String!
        value: String!
    }

    interface MemberListView {
        id: Int!
        pic: String

        firstname: String
        lastname: String

        family: Family!
        association: Association!
        area: Area!
        club: Club!,

        roles: [Role]
    }

    type SocialMedia {
        twitter: String
        linkedin: String
        facebook: String
        instagram: String
    }

    type Member implements MemberListView {
        id: Int!
        pic: String

        title: String
        firstname: String
        lastname: String

        address: Address

        family: Family!
        association: Association!
        area: Area!
        club: Club!,

        birthdate: Date
        datejoined: Date

        phonenumbers: [CommunicationElement!]
        emails: [CommunicationElement!]

        rtemail: String
        partner: String

        roles: [Role!]

        modifiedon: Date

        socialmedia: SocialMedia
        educations: [Education!]
        companies: [Company!]

        availableForChat: Boolean
        sharesLocation: Boolean
    }

    input MemberFilterInput {
        "deprecated use byArea"
        areas: [Int!]

        byArea: [ID!]

        nationalBoard: Boolean
        areaBoard: Boolean
    }

    extend type Query {
        #MembersList (filter: MemberFilterInput!): [MemberListView!]!

        OwnTable: [Member!]!
        FavoriteMembers: [Member!]!

        # leave for compat with existing clint
        MembersOverview(filter: MemberFilterInput): [MemberListView!]!

        Member (id: Int!): Member
        Members (ids: [Int!]!): [Member!]
    }
`;
