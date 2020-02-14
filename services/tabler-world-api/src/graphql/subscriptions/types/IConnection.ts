import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { OperationMessagePayload } from 'subscriptions-transport-ws';

export interface IConnectionContext {
    [key: string]: string;
    version: string;
}

export interface IConnection {
    connectionId: string;
    memberId: number;
    principal: IPrincipal;

    payload?: OperationMessagePayload;
    context: IConnectionContext;
}
