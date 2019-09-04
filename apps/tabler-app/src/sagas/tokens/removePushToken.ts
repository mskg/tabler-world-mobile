import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { AsyncStorage } from 'react-native';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { RemoveToken, RemoveTokenVariables } from '../../model/graphql/RemoveToken';
import { TOKEN_KEY } from '../../tasks/Constants';
import { logger } from './logger';

export function* removePushToken() {
    const token = yield AsyncStorage.getItem(TOKEN_KEY);
    if (token == null) {
        logger.debug('no token');
        return;
    }

    logger.debug('removeToken', token);

    try {
        const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();
        yield client.mutate<RemoveToken, RemoveTokenVariables>({
            mutation: gql`
mutation RemoveToken($token: String!) {
    removeToken(token: $token)
}`,
            variables: {
                token,
            },
        });

        yield AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        logger.log(error);
    }
}
