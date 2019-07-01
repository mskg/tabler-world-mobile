import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { AsyncStorage } from 'react-native';
import { select, take } from 'redux-saga/effects';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { AddToken, AddTokenVariables } from '../../model/graphql/AddToken';
import { IAppState } from '../../model/IAppState';
import * as actions from '../../redux/actions/settings';
import * as userActions from '../../redux/actions/user';
import { TOKEN_KEY } from '../../tasks/Const';
import { logger } from './logger';

export function* storePushToken(arg: typeof actions.storePushToken.shape) {
    const state = yield select((state: IAppState) => state.auth.state);
    if (state !== "singedIn") {
        logger.log("User is not singed in, defering");
        yield take(userActions.singedIn.type);
    }

    logger.debug("storeToken", arg.payload);

    try {
        const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();
        yield client.mutate<AddToken, AddTokenVariables>({
            mutation: gql`
mutation AddToken($token: String!) {
    addToken(token: $token)
}`,
            variables: {
                token: arg.payload,
            },
        });

        // avoid cycling require
        yield AsyncStorage.setItem(TOKEN_KEY, arg.payload);
    }
    catch (error) {
        logger.log(error);
    }
}
