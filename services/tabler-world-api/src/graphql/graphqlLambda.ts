import { EXECUTING_OFFLINE, isXrayEnabled } from '@mskg/tabler-world-aws';
import { DataSources } from 'apollo-server-core/dist/graphqlOptions';
import { ApolloServer } from 'apollo-server-lambda';
import { ProxyHandler } from 'aws-lambda';
import depthLimit from 'graphql-depth-limit';
import { AuthPlugin } from './auth/AuthPlugin';
import { cacheInstance } from './cache/cacheInstance';
import { dataSources } from './dataSources';
import { executableSchema } from './executableSchema';
import { constructContext } from './helper/constructContext';
import { XRayRequestExtension } from './helper/XRayRequestExtension';
import { AuditExtension } from './logging/AuditExtension';
import { LogErrorsExtension } from './logging/LogErrorsExtension';
import { TraceRequestExtension } from './logging/TraceRequestExtension';
import { RateLimitPlugin } from './ratelimit/RateLimitPlugin';
import { IApolloContext } from './types/IApolloContext';
import { Environment } from './Environment';

const extensions: any[] = [
    () => new AuditExtension(),
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

const server = new ApolloServer({
    schema: executableSchema,

    // cacheControl: {
    //   // defaultMaxAge: 60*60*24,
    //   stripFormattedExtensions: false,
    //   calculateHttpHeaders: false,
    // },

    // tslint:disable-next-line: object-shorthand-properties-first
    plugins: [
        new AuthPlugin(),
        new RateLimitPlugin(),
    ],

    cache: cacheInstance,

    persistedQueries: {
        ttl: Environment.Query.tll,
        cache: cacheInstance,
    },

    validationRules: [
        depthLimit(5),
    ],

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

