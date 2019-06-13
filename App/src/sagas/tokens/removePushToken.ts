import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { AsyncStorage } from 'react-native';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { TOKEN_KEY } from '../../tasks/Const';
import { logger } from './logger';

export function* removePushToken() {
    const token = yield AsyncStorage.getItem(TOKEN_KEY);
    if (token == null) {
        logger.debug("no token");
        return;
    }

    logger.debug("removeToken", token);

    try {
        const client: ApolloClient<NormalizedCacheObject> = yield bootstrapApollo();
        yield client.mutate({
            mutation: gql`
mutation removeToken($token: String!) {
    removeToken(token: $token)
}`,
            variables: {
                token,
            },
        });

        yield AsyncStorage.removeItem(TOKEN_KEY);
    }
    catch (error) {
        logger.log(error);
    }
}
