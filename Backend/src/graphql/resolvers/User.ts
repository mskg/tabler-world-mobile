import { ForbiddenError } from "apollo-server-lambda";
import { IApolloContext } from "../types/IApolloContext";
import { getMemberReader } from "./helper";

export const UserResolver = {
    Query: {
        Me: async (_root: any, _args: any, context: IApolloContext) => {
            const me = getMemberReader(context).readOne(
                (await context.filterContext()).id
            );

            if (me == null) throw new ForbiddenError("User not found");
            return me;
        }
    }
}