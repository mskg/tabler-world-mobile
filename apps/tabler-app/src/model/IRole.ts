import { RoleType } from './graphql/globalTypes';

export const ROLE_GROUP_BOARD = 'Board';
export const ROLE_GROUP_BOARD_ASSIST = 'Board Assistants';

export enum RoleNames {
    President = 'President',
    VP = 'Vice-President',
    PP = 'Past-President',

    IRO = 'I.R.O.',
    Treasurer = 'Treasurer',

    PRO = 'P.R.O.',
    CSO = 'C.S.O.',
    WEB = 'Webmaster',

    IT = 'IT Admin',
    Editor = 'Editor',
    CDO = 'Corporate Design Officer',

    Secretary = 'Secretary',
    Shop = 'Shopkeeper',
}

export const RoleOrderByMapping = {
    [RoleNames.President]: 1,
    [RoleNames.VP]: 2,
    [RoleNames.PP]: 3,

    [RoleNames.IRO]: 4,
    [RoleNames.Treasurer]: 5,

    [RoleNames.PRO]: 6,
    [RoleNames.CSO]: 7,
    [RoleNames.WEB]: 8,

    [RoleNames.IT]: 9,
    [RoleNames.Editor]: 10,
    [RoleNames.CDO]: 11,

    [RoleNames.Secretary]: 12,
    [RoleNames.Shop]: 13,
};

export type IRole = {
    name: string;

    level: string;
    group: string; // Board, VIP, etc.

    ref: {
        id: string,
        name: string,
        type: RoleType,
    };
};
