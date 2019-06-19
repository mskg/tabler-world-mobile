import { ApolloServer } from 'apollo-server-lambda';
import { makeExecutableSchema } from 'graphql-tools';
import { cacheInstance } from './cache/instance';
import { constructContext } from './constructContext';
import { LogErrorsExtension } from './logging/LogErrorsExtension';
import { TraceRequestExtension } from './logging/TraceRequestExtension';
import { resolvers } from './resolvers';
import { schema } from './schema';

const extensions: any[] = [
  () => new LogErrorsExtension(),
];

if (process.env.API_DEBUG_USER) {
  extensions.push(
    () => new TraceRequestExtension()
  )
};

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  }),

  // cacheControl: {
  //   // defaultMaxAge: 60*60*24,
  //   stripFormattedExtensions: false,
  //   calculateHttpHeaders: false,
  // },

  persistedQueries: {
    cache: cacheInstance
  },

  extensions,
  context: constructContext,
});

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});