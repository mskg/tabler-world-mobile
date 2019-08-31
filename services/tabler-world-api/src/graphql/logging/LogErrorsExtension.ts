import { GraphQLResponse } from "apollo-server-core";
import { GraphQLExtension } from "apollo-server-lambda";
import { print } from "graphql";
import { IApolloContext } from "../types/IApolloContext";

export class LogErrorsExtension extends GraphQLExtension<IApolloContext> {
    // need to save variables
    public requestDidStart(o: any) {
        try {
            o.context.requestCache.queryString = o.queryString;
            o.context.requestCache.parsedQuery = o.parsedQuery;
            o.context.requestCache.variables = o.variables;
        } catch (e) {
            o.context.logger.error("Faild to extract query and variables", e);
        }
    }

    public willSendResponse(o: {
        graphqlResponse: GraphQLResponse;
        context: IApolloContext;
    }) {
        try {
            const { context, graphqlResponse } = o;

            if (graphqlResponse.errors) {
                const query = context.requestCache.queryString || print(context.requestCache.queryString);
                const variables = context.requestCache.variables;

                graphqlResponse.errors.forEach(
                    (err) => context.logger.error("Query", query, "Variables", variables, "Error", err));
            }
        } catch (e) {
            o.context.logger.error("Faild to log error", e);
        }
    }
}
