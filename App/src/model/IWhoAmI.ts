export interface IWhoAmI {
    club:{
        id: string,
        club: number,
    },

    area:{
        id: string,
        area: number,
    },

    association:{
        association: string,
    },

    pic?: string;

    firstname: string;
    lastname: string;

    id: number;
}
