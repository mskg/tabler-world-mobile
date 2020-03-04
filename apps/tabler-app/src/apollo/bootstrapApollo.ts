import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { createPersistedQueryLink } from 'apollo-link-persisted-queries';
import { RetryLink } from 'apollo-link-retry';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { IApolloContext } from '../helper/createApolloContext';
import { extract429Details } from '../helper/extract429Details';
import { getConfigValue } from '../helper/getConfigValue';
import { Features, isFeatureEnabled } from '../model/Features';
import { DocumentDir, EncryptedFileStorage } from '../redux/persistor/EncryptedFileStorage';
import { fetchAuth, fetchAuthDemo } from './authLink';
import { cache } from './cache';
import { errorLink } from './errorLink';
import { logger } from './logger';
import { Resolvers } from './resolver';
import { subscriptionClient } from './subscriptionClient';

let client: ApolloClient<NormalizedCacheObject>;
let persistor: CachePersistor<NormalizedCacheObject>;

export function getApolloCachePersistor(): CachePersistor<NormalizedCacheObject> {
    return persistor;
}

export function cachedAolloClient() {
    return client;
}

// tslint:disable-next-line: max-func-body-length
export async function bootstrapApollo({ demoMode, noWebsocket }: { demoMode?: boolean; noWebsocket?: boolean; } = {}): Promise<ApolloClient<NormalizedCacheObject>> {
    if (client != null && demoMode == null) {
        console.warn(
            `
*********************************************************
This must only be called once in the lifecyle!
*********************************************************`,
        );

        return client;
    }

    persistor = new CachePersistor({
        cache,
        // @ts-ignore Signature is compatible
        storage: EncryptedFileStorage(DocumentDir, 'data', isFeatureEnabled(Features.EncryptedStorage)),
        debug: __DEV__,
        trigger: 'background',
        maxSize: 0,
    });

    const api = getConfigValue('api');
    const httpLink = createHttpLink({
        uri: api + (demoMode ? '/graphql-demo' : '/graphql'),
        fetch: !demoMode ? fetchAuth : fetchAuthDemo,
    });

    const wsLink = isFeatureEnabled(Features.Chat) ? new WebSocketLink(subscriptionClient) : null;

    const links = ApolloLink.from([
        new RetryLink({
            attempts: {
                max: 3,
                retryIf: (error, operation) => {
                    const context = operation.getContext() as IApolloContext | undefined;
                    if (context?.doNotRetry) {
                        return false;
                    }

                    // in case of timeout, just retry the operation
                    return error && (error.statusCode === 502 || error.statusCode === 429);
                },
            },

            // if we receive a throttle from the server, we know the time how long we need to wait
            delay: (count, _operation, error) => {
                const details = extract429Details(error);

                if (details.is429 && details.retryAfter) {
                    logger.log('Received 429, waiting for', details.retryAfter);
                    return details.retryAfter;
                }

                // tslint:disable-next-line: insecure-random
                return count * 300 * Math.random();
            },
        }),

        errorLink,

        !demoMode
            ? createPersistedQueryLink({
                useGETForHashedQueries: true,
            })
            : undefined,

        wsLink != null && !demoMode && !noWebsocket
            ? ApolloLink.split(
                // split based on operation type
                ({ query }) => {
                    const node = getMainDefinition(query);
                    return node.kind === 'OperationDefinition' && node.operation === 'subscription';
                },
                wsLink,
                httpLink,
            )
            : httpLink,
    ].filter((f) => f != null) as ApolloLink[]);

    client = new ApolloClient({
        cache,
        link: links,
        connectToDevTools: __DEV__,

        resolvers: Resolvers,

        defaultOptions: {
            mutate: {
                errorPolicy: 'all',
            },

            query: {
                errorPolicy: 'all',
                fetchPolicy: 'cache-first',
            },

            watchQuery: {
                errorPolicy: 'all',
            },
        },
    });

    return client;
}
