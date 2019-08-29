import { isAdmin } from "../auth/isAdmin";
import { IApolloContext } from "../types/IApolloContext";

export const UserRolesResolver = {
    Query: {
        MyRoles: async (_root: any, _args: any, context: IApolloContext) => {
            return isAdmin(context.principal) ? ["jobs"] : []
        },
    },
}