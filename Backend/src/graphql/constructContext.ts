import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { Client } from "pg";
import { resolveUser } from "./auth/resolveUser";
import { Logger } from "./logging/Logger";
import { FilterContext } from "./privacy/FilterContext";
import { getFilterContext } from "./rds/filterContext";
import { IApolloContext } from "./types/IApolloContext";
import { IPrincipal } from "./types/IPrincipal";

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = ({ event, context }: Params): IApolloContext => {
    let resolvedEmail = resolveUser(event);

    const logger = new Logger(event.requestContext.requestId, resolvedEmail);
    logger.log("Resolved user");

    const cache: { [key: string]: any } = {};
    const principal: IPrincipal = { email: resolvedEmail };

    return ({
        lambdaEvent: event,
        lambdaContext: context,

        logger,
        cache: {},
        principal,

        filterContext: async (client: Client) => {
            let ctx: FilterContext | undefined = cache["filterContext"];

            if (ctx == null) {
                ctx = await getFilterContext(client, principal);
                cache["filterContext"] = ctx;
            }

            return ctx;
        },
    });
}

