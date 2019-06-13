
export interface IAddress {
    address_type?: number;
    city?: string;
    country?: string;
    id?: number;
    postal_code?: string;
    street1?: string;
    street2?: string;
}

export interface ICompany {
    name: string;
    email?: string;
    phone?: string;
    sector?: string;
    function?: string;
    begin_date?: Date;
    address: IAddress;
}


export interface IBankAccount {
    name: String
    owner: String
    iban: String
    bic: String
    currency: String
}

export interface IEducation {
    school?: string;
    education?: string;
    address: IAddress;
}

export const ROLE_GROUP_BOARD = "Board";
export const ROLE_GROUP_BOARD_ASSIST = "Board Assistants";

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

export interface IRole {
    name: string,

    level: string,
    group: string, // Board, VIP, etc.

    ref: {
        id: string,
        name: string,
        type: 'club' | 'assoc' | 'area',
    }
}

export interface IRemovedFlag {
    id: number;
    removed: boolean;
}

export interface ICommunicationElement {
    type: string;
    value: string;
}

export interface IMember {
    id: number;
    pic?: string;

    title: string;
    firstname: string;
    lastname: string;

    address?: IAddress;

    area: number;
    areaname: string;

    association: string;
    associationname: string;

    club: number;
    clubname: string;

    birthdate: string;

    phonenumbers?: ICommunicationElement[];
    emails?: ICommunicationElement[];

    rtemail: string;

    partner?: string;
    roles?: IRole[];

    modifiedon: Date;

    educations?: IEducation[];
    companies?: ICompany[];
}