import { IPrincipal, resolveWebPrincipal } from '@mskg/tabler-world-auth-client';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { GraphQLRequestContext, GraphQLResponse, HttpQueryError } from 'apollo-server-core';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { IApolloContext } from '../types/IApolloContext';

export class AuthPlugin implements ApolloServerPlugin<IApolloContext> {
    public requestDidStart(_outer: GraphQLRequestContext<IApolloContext>): any {
        return {
            responseForOperation: async (requestContext: GraphQLRequestContext<IApolloContext>): Promise<GraphQLResponse | null> => {
                let principal: IPrincipal;
                try {
                    principal = await useDatabase(
                        { logger: console },
                        (client) => resolveWebPrincipal(client, requestContext.context.lambdaEvent!),
                    );
                } catch (e) {
                    new ConsoleLogger().error('Failed to resolve principal', e);

                    throw new HttpQueryError(
                        401,
                        '{"text": "Unauthorized"}',
                        false,
                    );
                }

                // @ts-ignore
                requestContext.context.principal = principal;

                // @ts-ignore
                requestContext.context.logger = new ConsoleLogger(requestContext.context.lambdaContext?.awsRequestId, principal.id);

                // required!
                return null;
            },
        };
    }
}
