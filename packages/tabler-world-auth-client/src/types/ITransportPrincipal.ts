import { Family } from './Family';

/**
 * Serialized version for Lambda Context
 */
export interface ITransportPrincipal {
    version?: '1.2';
    family?: Family;

    // cognito id
    principalId?: string;

    id: number;
    email: string;

    association: string;
    area: string;
    club: string;

    roles?: string;
}
