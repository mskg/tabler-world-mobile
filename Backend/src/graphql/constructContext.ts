import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { resolveUser } from "./auth/resolveUser";
import { cacheInstance } from "./cache/instance";
import { Logger } from "./logging/Logger";
import { IApolloContext } from "./types/IApolloContext";

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = ({ event, context }: Params): IApolloContext => {
    let principal = resolveUser(event);

    const logger = new Logger(event.requestContext.requestId, principal.id);
    logger.log("Resolved user", principal);

    const requestCache = {};

    return ({
        lambdaEvent: event,
        lambdaContext: context,

        cache: cacheInstance,
        logger,
        requestCache,
        principal,
    });
}

