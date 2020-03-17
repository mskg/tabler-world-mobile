import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { OperationVariables } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { createApolloContext } from '../../helper/createApolloContext';
import { defaultParameters } from '@mskg/tabler-world-config-app';
import { logger } from './logger';

export async function updateCache(
    client: ApolloClient<NormalizedCacheObject>,
    query: DocumentNode,
    field: keyof typeof defaultParameters.timeouts,
    variables?: OperationVariables,
) {
    logger.log('Fetching', field);

    try {
        await client.query({
            query,
            variables,
            fetchPolicy: 'network-only',
            context: createApolloContext('background-fetch', { doNotRetry: true }),
        });

        client.writeData({
            data: {
                LastSync: {
                    __typename: 'LastSync',
                    [field]: Date.now(),
                },
            },
        });
    } catch (error) {
        // error is already theres
        logger.log('Failed background fetch', error);
    }
}
