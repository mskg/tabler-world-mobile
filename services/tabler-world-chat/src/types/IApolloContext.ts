import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { ILogger } from '@mskg/tabler-world-common';

export interface IChatContext {
    logger: ILogger;
    principal: IPrincipal;
}
