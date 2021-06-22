import { RoleType } from './graphql/globalTypes';

export const ROLE_GROUP_BOARD = 'Board';
export const ROLE_GROUP_BOARD_ASSIST = 'Board Assistants';

export enum RoleNames {
    President = 'President',

    VP = 'Vice-President',

    VP2 = 'Vice President Elect', // c41
    VP3 = 'Vice President', // c41

    PP = 'Past-President',
    PP2 = 'Past President',  // c41

    IRO = 'I.R.O.',
    IRO2 = 'I.R.O.2',  // c41
    Treasurer = 'Treasurer',

    PRO = 'P.R.O.',
    CSO = 'C.S.O.',
    WEB = 'Webmaster',
    WEB2 = 'Webmaster II',  // c41

    IT = 'IT Admin',
    Editor = 'Editor',
    Archivar = 'Archivar',  // c41

    CDO = 'Corporate Design Officer',

    Secretary = 'Secretary',
    Shop = 'Shopkeeper',
}

export const RoleOrderByMapping = {
    [RoleNames.President]: 1,
    [RoleNames.VP]: 2,
    [RoleNames.VP2]: 2,
    [RoleNames.VP3]: 2,

    [RoleNames.PP]: 3,
    [RoleNames.PP2]: 3,

    [RoleNames.IRO]: 4,
    [RoleNames.IRO2]: 4,

    [RoleNames.Treasurer]: 5,

    [RoleNames.PRO]: 6,
    [RoleNames.CSO]: 7,

    [RoleNames.WEB]: 8,
    [RoleNames.WEB2]: 8,

    [RoleNames.IT]: 9,
    [RoleNames.Editor]: 10,
    [RoleNames.CDO]: 11,

    [RoleNames.Secretary]: 12,
    [RoleNames.Shop]: 13,
    [RoleNames.Archivar]: 13,
};

export type IRole = {
    name: string;

    level: string;
    group: string; // Board, VIP, etc.

    ref: {
        id: string,
        shortname: string,
        type: RoleType,
    };
};
