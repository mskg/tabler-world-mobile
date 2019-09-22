import { ApolloServer } from 'apollo-server-lambda';
import { constructContext } from './constructContext';
import { schema } from './schema/schema';

const server = new ApolloServer({
    schema,
    context: constructContext,
});

// tslint:disable-next-line: export-name
export const handler = server.createHandler({
    cors: {
        origin: '*',
        credentials: true,
    },
});

