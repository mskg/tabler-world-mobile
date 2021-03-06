import { ConsoleLogger, Metric } from '@mskg/tabler-world-common';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { cacheInstance } from '../cache/cacheInstance';
import { createLimiter } from '../ratelimit/createLimiter';
import { IApolloContext } from '../types/IApolloContext';
import { extractDeviceID, extractPlatform, extractVersion } from './extractVersion';

type Params = { event: APIGatewayProxyEvent, context: Context };

export const constructContext = async ({ event, context }: Params): Promise<IApolloContext> => {
    // datasources is provided by Apollo
    // @ts-ignore
    return ({
        clientInfo: {
            version: extractVersion(event.headers),
            os: extractPlatform(event.headers),
            device: extractDeviceID(event.headers),
        },

        lambdaEvent: event,
        lambdaContext: context,

        cache: cacheInstance,
        logger: new ConsoleLogger(),
        requestCache: {},

        metrics: new Metric(),

        // @ts-ignore
        // this is set by AuthPlugin
        principal: undefined,

        getLimiter: createLimiter,
    });
};

