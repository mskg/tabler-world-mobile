import { IPrincipal } from '@mskg/tabler-world-auth-client';

export interface IConnection<Context = any> {
    connectionId: string;
    memberId: number;
    principal: IPrincipal;
    context: Context;
}
