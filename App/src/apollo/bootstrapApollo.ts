import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { createPersistedQueryLink } from 'apollo-link-persisted-queries';
import { getConfigValue } from '../helper/Configuration';
import { Features, isFeatureEnabled } from '../model/Features';
import { DocumentDir, EncryptedFileStorage } from '../redux/persistor/EncryptedFileStorage';
import { fetchAuth, fetchAuthDemo } from './authLink';
import { cache } from './cache';
import { errorLink } from './errorLink';
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
    if (client != null && demoMode == undefined) return client;

    persistor = new CachePersistor({
      cache,
    // @ts-ignore
      storage: EncryptedFileStorage(DocumentDir, 'data', isFeatureEnabled(Features.EncryptedStorage)),
      debug: __DEV__,
      trigger: 'background',
      maxSize: 0,
  });

    const api = getConfigValue('api');

  // @ts-ignore
    const links = ApolloLink.from([
    errorLink,

    !demoMode ? createPersistedQueryLink({
      useGETForHashedQueries: true,
    }) : undefined,

    createHttpLink({
        uri: api + (demoMode ? '/graphql-demo' : '/graphql'),
        fetch: !demoMode ? fetchAuth : fetchAuthDemo,
    }),
  ].filter(f => f != undefined));

    client = new ApolloClient({
      cache,
      link: links,
      connectToDevTools: __DEV__,

      resolvers: Resolvers,

      defaultOptions: {
        mutate: {
          errorPolicy: 'none',
          fetchPolicy: 'no-cache',
      },

        query: {
          errorPolicy: 'all',
          fetchPolicy: 'cache-first',
      },

        watchQuery: {
          errorPolicy: 'none',
      },
    },
  });

    return client;
}
