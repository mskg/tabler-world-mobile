import { GraphQLRequestContext, GraphQLResponse, HttpQueryError } from 'apollo-server-core';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { Metrics } from '../logging/Metrics';
import { IApolloContext } from '../types/IApolloContext';
import { HEADER_KEY, throw429 } from './throw429';

export class RateLimitPlugin implements ApolloServerPlugin<IApolloContext> {
    // need to save variables
    public requestDidStart(_outer: GraphQLRequestContext<IApolloContext>): any {
        return {
            responseForOperation: async (requestContext: GraphQLRequestContext<IApolloContext>): Promise<GraphQLResponse | null> => {
                const limiter = requestContext.context.getLimiter('requests');
                const result = await limiter.use(requestContext.context.principal.id);

                if (result.rejected) {
                    requestContext.context.metrics.increment(Metrics.ThrottleGlobal);
                    throw429(result.retryDelta);
                }

                // required!
                return null;
            },

            /**
             * This is a trick to be able to throw 429 from inside resolvers
             */
            willSendResponse: async (requestContext: GraphQLRequestContext<IApolloContext>) => {
                // @ts-ignore
                if (requestContext.response?.errors?.length > 0) {

                    // @ts-ignore
                    const error = requestContext.response.errors[0].extensions?.exception as HttpQueryError;

                    // @ts-ignore
                    if (error && error.statusCode === 429) {
                        let timeout = 0;

                        if (error.headers && error.headers[HEADER_KEY]) {
                            timeout = parseInt(error.headers[HEADER_KEY], 10);
                        }

                        throw429(timeout);
                    }
                }
            },
        };
    }
}
