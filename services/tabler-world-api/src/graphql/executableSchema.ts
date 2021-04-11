import { makeExecutableSchema } from '@graphql-tools/schema';
import { AuthDirective } from './auth/AuthDirective';
import { resolvers } from './resolvers';
import { schema } from './schema';

export const executableSchema = makeExecutableSchema({
    resolvers,
    typeDefs: schema,
    schemaDirectives: {
        auth: AuthDirective,
    },
});
