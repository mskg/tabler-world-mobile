import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

type TokenArgs = {
    token: string,
}

export const TokenResolver = {
    Mutation: {
        addToken: async (_root: any, args: TokenArgs, context: IApolloContext) => {
            return useDatabase(
                context,
                async (client) => {
                    // merges the token with all existing tokens
                    // duplicate tokens are removed
                    await client.query(`
INSERT INTO usersettings(id, tokens)
VALUES ($1, ARRAY[$2])
ON CONFLICT (id) DO UPDATE
    SET tokens =
    (
        SELECT ARRAY(
            SELECT DISTINCT unnest(array_cat(usersettings.tokens, excluded.tokens))
        ORDER BY 1)
    )`,
                        //@ts-ignore
                        [context.principal.id, args.token]);

                    return true;
                }
            )
        },

        removeToken: async (_root: any, args: TokenArgs, context: IApolloContext) => {
            if (args == null) return;

            return useDatabase(
                context,
                async (client) => {
                    // merges the token with all existing tokens
                    // duplicate tokens are removed
                    await client.query(`
UPDATE usersettings
SET tokens =
(
    select array_agg(elem)
    from unnest(tokens) elem
    where elem <> $2 and elem is not null
)
WHERE id = $1`,
                        //@ts-ignore
                        [context.principal.id, args.token]);

                    return true;
                }
            )
        },
    }
}