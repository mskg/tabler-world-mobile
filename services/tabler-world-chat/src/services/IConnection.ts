import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { OperationMessagePayload } from 'subscriptions-transport-ws';
export interface IConnection {
    connectionId: string;
    memberId: number;
    principal: IPrincipal;
    // subscriptionId?: string,
    payload?: OperationMessagePayload;
}
