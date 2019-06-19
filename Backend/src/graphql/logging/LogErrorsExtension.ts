import { GraphQLResponse } from 'apollo-server-core';
import { GraphQLExtension } from 'apollo-server-lambda';
import { print } from 'graphql';
import { IApolloContext } from '../types/IApolloContext';

export class LogErrorsExtension extends GraphQLExtension<IApolloContext> {
    // need to save variables
    requestDidStart(o: any) {
        try {
        o.context.cache["queryString"] = o.queryString;
        o.context.cache["parsedQuery"] = o.parsedQuery;
        o.context.cache["variables"] = o.variables;
        }
        catch (e) {
            o.context.logger.error("Faild to extract query and variables", e);
        }
    }

    willSendResponse(o: {
        graphqlResponse: GraphQLResponse;
        context: IApolloContext;
    }) {
        try {
            const { context, graphqlResponse } = o;

            if (graphqlResponse.errors) {
                const query = context.requestCache["queryString"] || print(context.requestCache["queryString"]);
                const variables = context.requestCache["variables"];

                graphqlResponse.errors.forEach(
                    err => context.logger.error("Query", query, "Variables", variables, "Error", err));
            }
        }
        catch (e) {
            o.context.logger.error("Faild to log error", e);
        }
    }
}
