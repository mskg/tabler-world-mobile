import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { createPersistedQueryLink } from 'apollo-link-persisted-queries';
import { RetryLink } from 'apollo-link-retry';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { getConfigValue } from '../helper/getConfigValue';
import { Features, isFeatureEnabled } from '../model/Features';
import { DocumentDir, EncryptedFileStorage } from '../redux/persistor/EncryptedFileStorage';
import { fetchAuth, fetchAuthDemo } from './authLink';
import { cache } from './cache';
import { errorLink } from './errorLink';
import { getCurrentIdentity } from './getCurrentIdentity';
import { Resolvers } from './resolver';

let client: ApolloClient<NormalizedCacheObject>;
let persistor: CachePersistor<NormalizedCacheObject>;

export function getPersistor(): CachePersistor<NormalizedCacheObject> {
    return persistor;
}

export function cachedAolloClient() {
    return client;
}

export async function bootstrapApollo(demoMode?: boolean): Promise<ApolloClient<NormalizedCacheObject>> {
    if (client != null && demoMode == null) return client;

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

    const wsApi = getConfigValue('ws-api');
    const wsLink = new WebSocketLink({
        uri: wsApi,
        options: {
            reconnect: true,
            lazy: true,

            connectionParams: async () => ({
                Authorization: await getCurrentIdentity(),
            }),
        },
    });

    const links = ApolloLink.from(
        [
            new RetryLink({
                attempts: {
                    retryIf: (error, _operation) => {
                        // in case of timeout, just retry the operation
                        return error && error.statusCode === 502;
                    },
                },
            }),

            errorLink,

            !demoMode
                ? createPersistedQueryLink({
                    useGETForHashedQueries: true,
                })
                : undefined,

            ApolloLink.split(
                // split based on operation type
                ({ query }) => {
                    const node = getMainDefinition(query);
                    return node.kind === 'OperationDefinition' && node.operation === 'subscription';
                },
                wsLink,
                httpLink,
            ),
        ].filter((f) => f != null) as ApolloLink[],
    );


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
