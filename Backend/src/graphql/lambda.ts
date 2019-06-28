import { ApolloServer } from 'apollo-server-lambda';
import { makeExecutableSchema } from 'graphql-tools';
import { cacheInstance } from './cache/instance';
import { constructContext } from './constructContext';
import { EXECUTING_OFFLINE } from './helper/isOffline';
import { NoIntrospection } from './helper/NoIntrospection';
import { LogErrorsExtension } from './logging/LogErrorsExtension';
import { TraceRequestExtension } from './logging/TraceRequestExtension';
import { resolvers } from './resolvers';
import { schema } from './schema';
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

  persistedQueries: {
    cache: cacheInstance
  },

  tracing: EXECUTING_OFFLINE,

  extensions,
  context: constructContext,
});

export const handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});