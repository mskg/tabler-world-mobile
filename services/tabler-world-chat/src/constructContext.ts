import { resolvePrincipal } from '@mskg/tabler-world-auth-client';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { IChatContext } from './types/IApolloContext';
import { Logger } from './utils/Logger';

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = ({ event }: Params): IChatContext => {
    const principal = resolvePrincipal(event);

    const logger = new Logger(event.requestContext.requestId, principal.id);
    logger.log('Constructing new context for principal', principal);

    // datasources is provided by Apollo
    // @ts-ignore
    return ({
        logger,
        principal,
    });
};

