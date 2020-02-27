import { GraphQLRequestContext, GraphQLResponse } from 'apollo-server-core';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { IApolloContext } from '../types/IApolloContext';
import { throw429 } from './throw429';

export class RateLimitPlugin implements ApolloServerPlugin<IApolloContext> {
    // need to save variables
    public requestDidStart(_outer: GraphQLRequestContext<IApolloContext>): any {
        return {
            responseForOperation: async (requestContext: GraphQLRequestContext<IApolloContext>): Promise<GraphQLResponse | null> => {
                const limiter = requestContext.context.getLimiter('requests');
                const result = await limiter.use(requestContext.context.principal.id);

                if (result.rejected) {
                    throw429();
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
                    if (requestContext.response.errors[0].extensions?.exception?.statusCode === 429) {
                        throw429();
                    }
                }
            },
        };
    }
}
