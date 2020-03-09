import { AuthenticatedUser } from './AuthenticatedUser';

export interface IConnection<Context = any> {
    connectionId: string;
    principal: AuthenticatedUser;
    context: Context;
}
