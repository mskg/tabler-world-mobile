import { ConsoleLogger } from '@mskg/tabler-world-common';
import { GraphQLRequestContext, GraphQLResponse } from 'apollo-server-core';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { RedisStorage } from '../helper/RedisStorage';
import { IApolloContext } from '../types/IApolloContext';
import { RollingLimit } from './RollingLimit';

const logger = new ConsoleLogger('rate');

export class RateLimitPlugin implements ApolloServerPlugin<IApolloContext> {
    limiter: RollingLimit;

    constructor(redis: RedisStorage, limit: number) {
        this.limiter = new RollingLimit({
            redis,
            name: 'global',
            limit,
            intervalMS: 1000,
        });
    }

    // need to save variables
    public requestDidStart(_outer: GraphQLRequestContext<IApolloContext>): any {
        return {
            responseForOperation: async (requestContext: GraphQLRequestContext<IApolloContext>): Promise<GraphQLResponse | void> => {
                const result = await this.limiter.use(`principal:${requestContext.context.principal.id.toString()}`);

                if (result.rejected) {
                    logger.log(`[${requestContext.context.principal.id}]`, 'rejected', result);

                    // @ts-ignore
                    return {
                        http: {
                            status: 509,
                        },
                        errors: [{
                            message: 'Too many requests',
                        }],
                    };
                }
            },
        };
    }
}
