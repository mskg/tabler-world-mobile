import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ApolloServer } from 'apollo-server-lambda';
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools';
import { LogErrorsExtension } from './logging/LogErrorsExtension';
import { mocks } from './mock/mocks';
import { resolvers } from './mock/resolvers';
import { schema } from './schema';

const executableSchema = makeExecutableSchema({
    resolvers,
    typeDefs: schema,
});

addMockFunctionsToSchema({
    mocks,
    schema: executableSchema,
    preserveResolvers: true,
});

const server = new ApolloServer({
    schema: executableSchema,

    extensions: [
        () => new LogErrorsExtension(),
    ],

    introspection: EXECUTING_OFFLINE,

    // required for extensions
    context: () => ({
        requestCache: {},
        logger: console,
    }),
});

// tslint:disable-next-line: export-name
export const handler = server.createHandler({
    cors: {
        origin: '*',
        credentials: true,
    },
});
