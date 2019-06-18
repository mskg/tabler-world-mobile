import gql from 'graphql-tag';
import { IWhoAmI } from '../../model/IWhoAmI';
import { MembersOverviewFragment } from '../Member/Queries';

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
        }

        area {
            id
            area
        }

        club {
            id
            club
        }

        firstname
        lastname
    }
`;

export const GetMembersQuery = gql`
  query GetMembersQuery {
    Me {
       ...MeFragment
    }

    MembersOverview {
        ...MembersOverviewFragment
    }
  }

  ${MembersOverviewFragment}
  ${MeFragment}
`;

export type GetMembersQueryType = {
    Me: GetMembersQueryType_Me,
    MembersOverview: GetMembersQueryType_MembersOverview,
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