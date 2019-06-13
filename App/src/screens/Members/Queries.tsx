import gql from 'graphql-tag';
import { MembersOverviewFragment } from '../Member/Queries';

export const GetLastSyncQuery = gql`
    query LastSync {
        LastSync @client {
            members
        }
    }
`;

export const GetMembersQuery = gql`
  query GetMembersQuery {
    Me {
        id
        pic
        club {
            id
            club
        }
        firstname
        lastname
    }

    MembersOverview {
        ...MembersOverviewFragment
    }
  }

  ${MembersOverviewFragment}
`;

export type GetMembersQueryType = {
    Me: {
        id: number,
        pic?: string,
        club: {
            id: number,
            club: number,
        }
        firstname: string,
        lastname: string,
    },
    MembersOverview: GetMembersQueryType_MembersOverview,
};

export type GetMembersQueryType_Role = {
    name: string,

    level: string,
    group: string, // Board, VIP, etc.

    ref: {
        id: string,
        name: string,
        type: 'club' | 'assoc' | 'area',
    }
};

export type GetMembersQueryType_MembersOverview = {
    id: number;
    pic?: string;

    area: {
        id: string,
        name: string,
    }

    club: {
        id: string,
        club: number,
        name: string,
    }

    firstname: string;
    lastname: string;

    roles?: GetMembersQueryType_Role[];
};