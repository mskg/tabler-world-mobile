import { IPrincipal } from '@mskg/tabler-world-auth-client';

export interface IConnectionContext {
    [key: string]: string;
    version: string;
}

export interface IConnection {
    connectionId: string;
    memberId: number;
    principal: IPrincipal;
    context: IConnectionContext;
}
