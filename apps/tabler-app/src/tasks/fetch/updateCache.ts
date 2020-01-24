import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { OperationVariables } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { TimeoutDefaults } from '../../helper/parameters/Timeouts';
import { logger } from './logger';

export async function updateCache(
    client: ApolloClient<NormalizedCacheObject>,
    query: DocumentNode,
    field: keyof typeof TimeoutDefaults,
    variables?: OperationVariables,
) {
    logger.log('Fetching', field);
    await client.query({
        query,
        variables,
        fetchPolicy: 'network-only',
    });

    client.writeData({
        data: {
            LastSync: {
                __typename: 'LastSync',
                [field]: Date.now(),
            },
        },
    });

    // await getPersistor().persist();
}
