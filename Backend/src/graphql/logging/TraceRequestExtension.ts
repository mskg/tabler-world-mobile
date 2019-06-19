import { GraphQLExtension } from 'apollo-server-lambda';
import { IApolloContext } from '../types/IApolloContext';

export class TraceRequestExtension extends GraphQLExtension<IApolloContext> {
    requestDidStart({ context, queryString, variables }: {
        context: IApolloContext,
        queryString?: string,
        variables?: { [key: string]: any },
    }) {
        if (queryString && queryString.indexOf("IntrospectionQuery") > 0) { return; }
        if (!queryString) { return; }

        context.logger.log("Query", queryString);
        if (variables) { context.logger.log("Variables", variables); }
    }

    // willSendResponse({ _context }: {
    //     _context: IApolloContext,
    // }) {
    willSendResponse() {
        console.log("query done");
    }
}
