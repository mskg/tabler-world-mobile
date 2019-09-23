import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { ILogger } from '@mskg/tabler-world-common';

export interface ISubscriptionContext {
    connectionId: string;
    principal: IPrincipal;
    logger: ILogger;
}
