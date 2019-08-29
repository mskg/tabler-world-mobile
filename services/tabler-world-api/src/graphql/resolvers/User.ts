import { ForbiddenError } from "apollo-server-lambda";
import { IApolloContext } from "../types/IApolloContext";

export const UserResolver = {
    Query: {
        Me: async (_root: any, _args: any, context: IApolloContext) => {
            const me = context.dataSources.members.readOne(
                context.principal.id,
            );

            if (me == null) throw new ForbiddenError("User not found");
            return me;
        }
    }
}