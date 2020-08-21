import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ApolloServer } from 'apollo-server-lambda';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { LogErrorsExtension } from '../graphql/logging/LogErrorsExtension';
import { schema } from '../graphql/schema';
import { rootResolver } from './resolvers';
import { typeResolvers } from './resolvers/typeResolvers';
import depthLimit = require('graphql-depth-limit');

const executableSchema = makeExecutableSchema({
    resolvers: typeResolvers,
    typeDefs: schema,
});

const schemaWithMocks = addMocksToSchema({
    mocks: rootResolver,
    schema: executableSchema,
    preserveResolvers: true,
});

const server = new ApolloServer({
    schema: schemaWithMocks,

    extensions: [
        () => new LogErrorsExtension(),
    ],

    validationRules: [
        depthLimit(5),
    ],

    persistedQueries: false,
    tracing: EXECUTING_OFFLINE,
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
