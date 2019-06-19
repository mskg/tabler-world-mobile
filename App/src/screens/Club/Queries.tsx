import gql from 'graphql-tag';
import { ClubOverviewFragment } from '../Structure/Queries';

type ClubMember = {
    id: number,
    pic?: string,
    firstname: string,
    lastname: string,
}

const MemberFragment = gql`
    fragment MemberDetails on Member {
        id
        pic
        firstname
        lastname
    }
`;

const AddressFragment = gql`
    fragment AddressDetails on Address {
        street1
        street2
        postal_code
        city
    }
`;

export const RolesFragment = gql`
    fragment RoleDetails on Club {
        board {
            role
            member {
                ...MemberDetails
            }
        }

        boardassistants {
            role
            member {
                ...MemberDetails
            }
        }
    }

    ${MemberFragment}
`;

export const GetClubQuery = gql`
  query Club($id: String!) {
    Club(id: $id) {
        ...ClubOverviewDetails

        LastSync @client

        website
        facebook
        instagram
        twitter

        info {
            second_meeting
            first_meeting
            charter_date
            national_godparent
            international_godparent
        }

        meetingplace1 {
            ...AddressDetails
        }

        meetingplace2 {
            ...AddressDetails
        }

        account {
            name
            owner
            iban
            bic
            currency
        }

        board {
            role
            member {
                ...MemberDetails
            }
        }

        boardassistants {
            role
            member {
                ...MemberDetails
            }
        }

        members {
            ...MemberDetails
        }
    }
  }

  ${ClubOverviewFragment}
  ${AddressFragment}
  ${MemberFragment}
`;

export type GetClubQueryType = {
    Club: GetClubQueryType_Club,
};


export type GetClubQueryType_Address = {
    street1?: string,
    street2?: string,
    postal_code?: string,
    city?: string,
}


export type GetClubQueryType_Account = {
   name: string,
   owner: string,
   iban: string,
   bic: string,
   currency: string,
}

export type GetClubQueryType_Club = {
    LastSync: number;

    id: string,
    club: number,
    name: string,
    logo: string,

    website?: string,
    facebook?: string,
    instagram?: string,
    twitter?: string,

    account?: GetClubQueryType_Account,

    association: {
        name: string,
        association: string,
    }

    info: {
        first_meeting?: string,
        second_meeting?: string,
        charter_date: string,
        national_godparent: string,
        international_godparent: string,
    },

    meetingplace1?: GetClubQueryType_Address,
    meetingplace2?: GetClubQueryType_Address,

    area: {
        name: string,
    }

    board?: {
        role: string,
        member: ClubMember,
    }[]

    boardassistants?: {
        role: string,
        member: ClubMember,
    }[]

    members: ClubMember[]
};