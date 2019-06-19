import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { resolveUser } from "./auth/resolveUser";
import { cacheInstance } from "./cache/instance";
import { TTLs } from "./cache/TTLs";
import { writeThrough } from "./cache/writeThrough";
import { Logger } from "./logging/Logger";
import { FilterContext } from "./privacy/FilterContext";
import { getFilterContext } from "./rds/filterContext";
import { useDatabase } from "./rds/useDatabase";
import { IApolloContext } from "./types/IApolloContext";
import { IPrincipal } from "./types/IPrincipal";

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = ({ event, context }: Params): IApolloContext => {
    let resolvedEmail = resolveUser(event);

    const logger = new Logger(event.requestContext.requestId, resolvedEmail);
    logger.log("Resolved user");

    const cache: { [key: string]: any } = {};
    const principal: IPrincipal = { email: resolvedEmail };
    const requestCache = {};

    return ({
        lambdaEvent: event,
        lambdaContext: context,

        cache: cacheInstance,
        logger,
        requestCache,
        principal,

        filterContext: async () => {
            let ctx: FilterContext | undefined = cache["filterContext"];

            if (ctx == null) {
                ctx = await writeThrough(
                    {
                        cache: cacheInstance,
                        logger
                    },
                    `Principal_${principal.email}`,
                    () => useDatabase({logger, requestCache}, (client) => getFilterContext(client, principal)),
                    TTLs.FilterContext, // 1 hour
                );

                cache["filterContext"] = ctx;
            }

            return ctx;
        },
    });
}

