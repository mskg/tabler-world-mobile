import gql from 'graphql-tag';
import { IWhoAmI } from '../../model/IWhoAmI';
import { FullDetailsFragment, MembersOverviewFragment } from '../Member/Queries';

export const GetLastSyncQuery = gql`
    query LastSync {
        LastSync @client {
            members
        }
    }
`;

export const MeFragment = gql`
    fragment MeFragment on Member {
        id
        pic

        association {
            association
            name
        }

        area {
            id
            area
        }

        club {
            id
            club
            name
        }

        firstname
        lastname
    }
`;

export const GetMembersQuery = gql`
  query GetMembersQuery ($areas: [Int!]) {
    Me {
       ...MeFragment
    }

    MembersOverview (filter:{areas: $areas}) {
        ...MembersOverviewFragment
    }
  }

  ${MembersOverviewFragment}
  ${MeFragment}
`;

export const GetOfflineMembersQuery = gql`
  query GetOfflineMembersQuery {
    OwnTable {
        ...MembersOverviewFragment
        ...FullDetailsFragment
    }

    FavoriteMembers {
        ...MembersOverviewFragment
        ...FullDetailsFragment
    }
  }

  ${FullDetailsFragment}
  ${MembersOverviewFragment}
`;

export type GetMembersQueryType = {
    Me: GetMembersQueryType_Me,
    MembersOverview: GetMembersQueryType_MembersOverview[],
};

export type GetOfflineMembersQueryType = {
    OwnTable: GetMembersQueryType_MembersOverview[],
    FavoriteMembers: GetMembersQueryType_MembersOverview[],
};

export type GetMembersQueryType_Me = {
} & IWhoAmI;

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