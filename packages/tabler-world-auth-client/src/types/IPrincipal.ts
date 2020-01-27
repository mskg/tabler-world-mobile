export interface IPrincipal {
    version?: '1.2';
    family?: 'rti' | 'lci' | 'tci' | '41i';

    principalId?: string; // cognito id

    id: number;
    email: string;

    association: string;
    area: string;
    club: string;
}
