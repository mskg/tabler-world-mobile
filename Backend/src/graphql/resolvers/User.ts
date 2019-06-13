import { ForbiddenError } from "apollo-server-lambda";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

export const UserResolver = {
    Query: {
        Me: async (_root: any, _args: any, context: IApolloContext) => {
            return useDatabase(
                context.logger,
                async (client) => {
                    const res = await client.query(
                        `select * from profiles
where rtemail = $1 and removed = false`,
                        [context.principal.email]
                    );

                    if (res.rowCount !== 1) {
                        throw new ForbiddenError("User not found");
                    }

                    return res.rows[0];
                }
            )
        }
    }
}