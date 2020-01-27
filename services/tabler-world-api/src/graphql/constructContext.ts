import { lookupPrincipal, resolvePrincipal } from '@mskg/tabler-world-auth-client';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { cacheInstance } from './cache/cacheInstance';
import { Logger } from './logging/Logger';
import { IApolloContext } from './types/IApolloContext';

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = async ({ event, context }: Params): Promise<IApolloContext> => {
    let principal = resolvePrincipal(event);

    const logger = new Logger(event.requestContext.requestId, principal.id);
    logger.log('Constructing new context for principal', principal);

    // we must read everything again, as the ids changed
    // this is only valid during migration as we receive old tokens
    if (principal.version !== '1.2') {
        principal = await useDataService({ logger }, (client) => lookupPrincipal(client, principal.email));
        logger.log('> new context generated', principal);
    }

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

