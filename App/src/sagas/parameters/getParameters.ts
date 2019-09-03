import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import Constants from 'expo-constants';
import { AsyncStorage, Platform } from 'react-native';
import { select, take } from 'redux-saga/effects';
import { bootstrapApollo, getPersistor } from '../../apollo/bootstrapApollo';
import { GetParameters, GetParametersVariables } from '../../model/graphql/GetParameters';
import { ParameterName, ParameterPlatform } from '../../model/graphql/globalTypes';
import { IAppState } from '../../model/IAppState';
import { GetParametersQuery } from '../../queries/GetParameters';
import * as settingsActions from '../../redux/actions/settings';
import { singedIn } from '../../redux/actions/user';
import { logger } from './logger';

export function* getParameters(_a: typeof settingsActions.restoreSettings.shape) {
    logger.debug('Getting parameters');

    const authState = yield select((state: IAppState) => state.auth.state);
    if (authState !== 'singedIn') {
        logger.debug('Not signed in');
        yield take(singedIn.type);
    }

    const client: ApolloClient<NormalizedCacheObject> = yield bootstrapApollo();

    try {
        const result: ApolloQueryResult<GetParameters> = yield client.query<GetParameters, GetParametersVariables>({
            query: GetParametersQuery,
            fetchPolicy: 'network-only',
            variables: {
                info: {
                    version: Constants.manifest.revisionId || 'dev',
                    os: Platform.OS === 'android' ? ParameterPlatform.android : ParameterPlatform.ios,
                },
            },
        });

        yield getPersistor().persist();

        if (result.data.getParameters != null) {
            const keys = Object.keys(ParameterName).map((k) => `Parameter_${ParameterName[k]}`);
            logger.debug('Removing', keys);

            yield AsyncStorage.multiRemove(keys);

            if (result.data.getParameters.length > 0) {
                yield AsyncStorage.multiSet(
                    result.data.getParameters.map((p) => ([`Parameter_${p.name}`, JSON.stringify(p.value)])),
                );
            }

            logger.debug('Settings are', yield AsyncStorage.multiGet(keys));
        }
    } catch (e) {
        logger.error(e, 'Failed to load parameters');
    }
}
