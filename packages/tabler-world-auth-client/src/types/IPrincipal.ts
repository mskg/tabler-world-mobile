export interface IPrincipal {
    principalId?: string; // cognito id

    id: number;
    email: string;

    association: string;
    area: number;
    club: number;
}
