import { IApolloContext } from '../types/IApolloContext';

// tslint:disable: export-name
// tslint:disable: variable-name
export const UserRolesResolver = {
    Query: {
        MyRoles: async (_root: any, _args: any, context: IApolloContext) => {
            return context.principal.roles ?? [];
        },
    },
};
