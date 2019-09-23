import { makeExecutableSchema } from 'graphql-tools';
import { IChatContext } from '../types/IChatContext';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

export const schema = makeExecutableSchema<IChatContext>({
    typeDefs,

    // @ts-ignore
    resolvers,
});
