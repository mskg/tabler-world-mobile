import { DataSources } from 'apollo-server-core/dist/graphqlOptions';
import { ApolloServer } from 'apollo-server-lambda';
import { ProxyHandler } from 'aws-lambda';
import { makeExecutableSchema } from 'graphql-tools';
import warmer from 'lambda-warmer';
import { cacheInstance } from './cache/instance';
import { constructContext } from './constructContext';
import { dataSources } from './dataSources';
import { EXECUTING_OFFLINE } from './helper/isOffline';
import { NoIntrospection } from './helper/NoIntrospection';
import { LogErrorsExtension } from './logging/LogErrorsExtension';
import { TraceRequestExtension } from './logging/TraceRequestExtension';
import { resolvers } from './resolvers';
import { schema } from './schema';
import { IApolloContext } from './types/IApolloContext';
import { isXrayEnabled } from './xray/aws';
import { XRayRequestExtension } from './xray/XRayExtension';

const extensions: any[] = [
  () => new LogErrorsExtension(),
];

if (EXECUTING_OFFLINE) {
  console.log("Pushing TraceRequestExtension");

  extensions.push(
    () => new TraceRequestExtension()
  )
};

if (isXrayEnabled && process.env.XRAY_GRAPHQL_DISABLED !== "true") {
  console.log("Pushing XRayRequestExtension");

  extensions.push(
    () => new XRayRequestExtension()
  )
}

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  }),

  validationRules: process.env.IS_OFFLINE === 'true' ? undefined : [NoIntrospection],

  // cacheControl: {
  //   // defaultMaxAge: 60*60*24,
  //   stripFormattedExtensions: false,
  //   calculateHttpHeaders: false,
  // },

  cache: cacheInstance,

  persistedQueries: {
    cache: cacheInstance
  },

  dataSources: dataSources as unknown as () => DataSources<IApolloContext>,

  tracing: EXECUTING_OFFLINE,
  // mockEntireSchema: EXECUTING_OFFLINE,

  extensions,
  context: constructContext,
});

const serverHandler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});

export const handler: ProxyHandler = (event, context, callback) => {
  warmer(event).then((isWarmer: boolean) => {
    if (isWarmer) {
      callback(null, { statusCode: 200, body: 'warmed' });
    } else {
      serverHandler(event, context, callback);
    }
  });
}
