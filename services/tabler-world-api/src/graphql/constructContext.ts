import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { resolveUser } from './auth/resolveUser';
import { cacheInstance } from './cache/cacheInstance';
import { Logger } from './logging/Logger';
import { IApolloContext } from './types/IApolloContext';

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = ({ event, context }: Params): IApolloContext => {
    const principal = resolveUser(event);

    const logger = new Logger(event.requestContext.requestId, principal.id);
    logger.log('Constructing new context for principal', principal);

    // datasources is provided by Apollo
    // @ts-ignore
    return ({
        lambdaEvent: event,
        lambdaContext: context,

        cache: cacheInstance,
        logger,
        requestCache: {},
        principal,
    });
};

