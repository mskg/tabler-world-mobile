import { Family } from './Family';

export interface IPrincipal {
    version?: '1.2';
    family?: Family;

    id: number;
    email: string;

    association: string;
    area: string;
    club: string;

    roles?: string[];
}
