import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BatchHttpLink } from "apollo-link-batch-http";
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { RetryLink } from 'apollo-link-retry';
import Constants from 'expo-constants';
import { Features, isFeatureEnabled } from '../model/Features';
import { DocumentDir, EncryptedFileStorage } from '../redux/persistor/EncryptedFileStorage';
import { authLink } from './authLink';
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

export async function bootstrapApollo(): Promise<ApolloClient<NormalizedCacheObject>> {
  if (client != null) return client;

  persistor = new CachePersistor({
    cache,
    //@ts-ignore
    storage: EncryptedFileStorage(DocumentDir, "data", isFeatureEnabled(Features.EncryptedStorage)),
    debug: __DEV__,
    trigger: 'background',
    maxSize: 0,
  });

  const extra = Constants.manifest.extra || {};
  let { api } = extra;

  const links = ApolloLink.from([
    errorLink,
    authLink,
    new RetryLink({
      delay: {
        jitter: true
      }
    }),
    createPersistedQueryLink(),
    new BatchHttpLink({ uri: api + "/graphql" })
  ]);

  client = new ApolloClient({
    cache,
    link: links,
    connectToDevTools: __DEV__,

    resolvers: Resolvers,

    defaultOptions: {
      mutate: {
        errorPolicy: "all",
        fetchPolicy: "no-cache",
      },

      query: {
        errorPolicy: "all",
        fetchPolicy: "cache-first",
      },

      watchQuery: {
        errorPolicy: "all",
      }
    }
  });

  return client;
};