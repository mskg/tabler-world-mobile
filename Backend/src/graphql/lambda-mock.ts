import { ApolloServer } from 'apollo-server-lambda';
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools';
import { NoIntrospection } from './helper/NoIntrospection';
import { LogErrorsExtension } from './logging/LogErrorsExtension';
import { mocks } from "./mock/mocks";
import { resolvers } from './mock/resolvers';
import { schema } from './schema';

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

addMockFunctionsToSchema({
  schema: executableSchema,
  mocks,
  preserveResolvers: true,
});

const server = new ApolloServer({
  schema: executableSchema,
  validationRules: process.env.IS_OFFLINE === 'true' ? undefined : [NoIntrospection],

  extensions: [
    () => new LogErrorsExtension(),
  ],

  // required for extensions
  context: () => ({
    requestCache: {},
    logger: console,
  }),
});

export const handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
