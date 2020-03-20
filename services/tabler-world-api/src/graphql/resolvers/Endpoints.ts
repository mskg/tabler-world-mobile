import { makeCacheKey } from '@mskg/tabler-world-cache';
import { EndpointService, EndpointType } from '@mskg/tabler-world-push-client';
import { IApolloContext } from '../types/IApolloContext';

type TokenArgs = {
    endpoint: {
        type: EndpointType,
        token: string,
    },
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const EndpointsResolver = {
    Mutation: {
        registerEndpoint: async (_root: any, args: TokenArgs, context: IApolloContext) => {
            await context.cache.delete(makeCacheKey('Member', ['chat', 'enabled', context.principal.id]));
            await context.cache.delete(makeCacheKey('Member', ['chat', 'muted', context.principal.id]));

            if (!context.clientInfo.device) {
                throw new Error('Unkown deviceid');
            }

            const pm = new EndpointService();
            await pm.register(
                context.principal,
                {
                    deviceid: context.clientInfo.device,
                    type: args.endpoint.type,
                    token: args.endpoint.token,
                },
            );
        },

        removeEndpoint: async (_root: any, args: TokenArgs, context: IApolloContext) => {
            if (args == null) { return; }

            await context.cache.delete(makeCacheKey('Member', ['chat', 'enabled', context.principal.id]));
            await context.cache.delete(makeCacheKey('Member', ['chat', 'muted', context.principal.id]));

            if (!context.clientInfo.device) {
                throw new Error('Unkown deviceid');
            }

            const pm = new EndpointService();
            await pm.unregister(
                context.principal,
                {
                    deviceid: context.clientInfo.device,
                    type: args.endpoint.type,
                    token: args.endpoint.token,
                },
            );
        },
    },
};

