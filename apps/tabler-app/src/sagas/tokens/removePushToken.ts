import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { AsyncStorage } from 'react-native';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { RemoveToken, RemoveTokenVariables } from '../../model/graphql/RemoveToken';
import { TOKEN_KEY } from '../../tasks/Constants';
import { logger } from './logger';
import { createApolloContext } from '../../helper/createApolloContext';

export async function removePushToken() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token == null) {
        logger.debug('no token');
        return;
    }

    logger.debug('removeToken', token);

    try {
        const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();
        await client.mutate<RemoveToken, RemoveTokenVariables>({
            mutation: gql`
mutation RemoveToken($token: String!) {
    removeToken(token: $token)
}`,
            variables: {
                token,
            },

            context: createApolloContext('pushtoken-remove'),
        });

        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        logger.log(error);
    }
}
