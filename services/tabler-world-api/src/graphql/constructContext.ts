import { resolveWebPrincipal } from '@mskg/tabler-world-auth-client';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { cacheInstance } from './cache/cacheInstance';
import { extractPlatform, extractVersion } from './helper/extractVersion';
import { Logger } from './logging/Logger';
import { IApolloContext } from './types/IApolloContext';

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = async ({ event, context }: Params): Promise<IApolloContext> => {
    const principal = await useDataService({ logger: console }, (client) => resolveWebPrincipal(client, event));

    const logger = new Logger(event.requestContext.requestId, principal.id);
    logger.log('Constructing new context for principal', principal);

    // datasources is provided by Apollo
    // @ts-ignore
    return ({
        clientInfo: {
            version: extractVersion(event.headers),
            os: extractPlatform(event.headers),
        },

        lambdaEvent: event,
        lambdaContext: context,

        cache: cacheInstance,
        logger,
        requestCache: {},
        principal,
    });
};

