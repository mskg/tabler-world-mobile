import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import Constants from 'expo-constants';
import { AsyncStorage, Platform } from 'react-native';
import { select } from 'redux-saga/effects';
import { bootstrapApollo, getPersistor } from '../../apollo/bootstrapApollo';
import { GetParameters, GetParametersVariables } from '../../model/graphql/GetParameters';
import { ParameterName, ParameterPlatform } from '../../model/graphql/globalTypes';
import { IAppState } from '../../model/IAppState';
import { HashMap } from '../../model/Maps';
import { GetParametersQuery } from '../../queries/GetParameters';
import * as settingsActions from '../../redux/actions/settings';
import { logger } from './logger';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* getParameters(a: typeof settingsActions.restoreSettings.shape) {
    logger.debug("Getting parameters");

    const authState = yield select((state: IAppState) => state.auth.state);
    if (authState !== "singedIn") {
        logger.debug("Not signed in");
        return;
    }

    const client: ApolloClient<NormalizedCacheObject> = yield bootstrapApollo();

    try {
        const result: ApolloQueryResult<GetParameters> = yield client.query<GetParameters, GetParametersVariables>({
            query: GetParametersQuery,
            fetchPolicy: "network-only",
            variables: {
                info: {
                    version: Constants.manifest.revisionId || 'dev',
                    os: Platform.OS == "android" ? ParameterPlatform.android : ParameterPlatform.ios,
                }
            }
        });

        yield getPersistor().persist();

        if (result.data.getParameters != null) {
            yield AsyncStorage.multiRemove(
                Object.keys(ParameterName)
            );

            yield AsyncStorage.multiSet(
                result.data.getParameters.map(p => ([`Parameter_${p.name}`, JSON.stringify(p.value)]))
            );
        }
    } catch (e) {
        logger.error(e, "Failed to load parameters");
    }
}
