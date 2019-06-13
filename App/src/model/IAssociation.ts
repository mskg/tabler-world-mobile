// import { IAddress } from './IMember';

export interface IAssociationRole {
    member: number,
    role: string,
}

// type Board = IAssociationRole[];

// export interface IAssociation {
//     association: string,
//     name: string,

//     areas: string[],

//     board: Board,
//     boardassistants: Board,
// }

// export interface IArea {
//     id: string,
//     association: string,
//     area: number,

//     name: string,

//     clubs: string[],
//     board: Board,
// }

// export interface IClub {
//     id: string,
//     association: string,
//     area: string,

//     club: number,
//     name: string,

//     board: Board,
//     boardassistants: Board,

//     logo?: string,

//     meetingplace1?: IAddress,
//     meetingplace2?: IAddress,

//     info?: {
//         charter_date?: Date,
//         first_meeting?: string,
//         second_meeting?: string,
//         national_godparent?: string,
//         international_godparent?: string,
//     },

//     website?: string,
//     instagram?: string,
//     facebook?: string,
//     twitter?: string,
// }
