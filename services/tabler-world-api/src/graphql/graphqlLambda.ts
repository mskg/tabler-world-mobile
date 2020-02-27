import { EXECUTING_OFFLINE, isXrayEnabled } from '@mskg/tabler-world-aws';
import { PluginDefinition } from 'apollo-server-core';
import { DataSources } from 'apollo-server-core/dist/graphqlOptions';
import { ApolloServer } from 'apollo-server-lambda';
import { ProxyHandler } from 'aws-lambda';
import { AuthPlugin } from './auth/AuthPlugin';
import { cacheInstance } from './cache/cacheInstance';
import { constructContext } from './helper/constructContext';
import { dataSources } from './dataSources';
import { Environment } from './Environment';
import { executableSchema } from './executableSchema';
import { createRedisStorage } from './helper/createRedisStorage';
import { XRayRequestExtension } from './helper/XRayRequestExtension';
import { LogErrorsExtension } from './logging/LogErrorsExtension';
import { TraceRequestExtension } from './logging/TraceRequestExtension';
import { RateLimitPlugin } from './ratelimit/RateLimitPlugin';
import { IApolloContext } from './types/IApolloContext';

const extensions: any[] = [
    () => new LogErrorsExtension(),
];

if (EXECUTING_OFFLINE) {
    console.log('Pushing TraceRequestExtension');

    extensions.push(
        () => new TraceRequestExtension(),
    );
}

if (isXrayEnabled && process.env.XRAY_GRAPHQL_DISABLED !== 'true') {
    console.log('Pushing XRayRequestExtension');

    extensions.push(
        () => new XRayRequestExtension(),
    );
}

const plugins: PluginDefinition[] = [
    new AuthPlugin(),
];

if (Environment.Caching.useRedis && !Environment.Throtteling.disabled) {
    plugins.push(
        new RateLimitPlugin(
            createRedisStorage(),
            Environment.Throtteling.rateLimit,
        ),
    );
}

const server = new ApolloServer({
    schema: executableSchema,

    // cacheControl: {
    //   // defaultMaxAge: 60*60*24,
    //   stripFormattedExtensions: false,
    //   calculateHttpHeaders: false,
    // },

    // tslint:disable-next-line: object-shorthand-properties-first
    plugins,
    cache: cacheInstance,

    persistedQueries: {
        cache: cacheInstance,
    },

    dataSources: dataSources as unknown as () => DataSources<IApolloContext>,

    tracing: EXECUTING_OFFLINE,
    introspection: EXECUTING_OFFLINE,

    // tslint:disable-next-line: object-shorthand-properties-first
    extensions,
    context: constructContext,
});

const serverHandler = server.createHandler({
    cors: {
        origin: '*',
        credentials: true,
    },
});

// tslint:disable-next-line: export-name
export const handler: ProxyHandler = serverHandler;

