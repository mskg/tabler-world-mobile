import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import Constants from 'expo-constants';
import { AsyncStorage, Platform } from 'react-native';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { GetParameters, GetParametersVariables } from '../../model/graphql/GetParameters';
import { ParameterName, ParameterPlatform } from '../../model/graphql/globalTypes';
import { GetParametersQuery } from '../../queries/GetParametersQuery';
import { Categories, Logger } from '../Logger';

const logger = new Logger(Categories.Sagas.Parameters);

export async function updateParameters() {
    const client: ApolloClient<NormalizedCacheObject> = await bootstrapApollo();

    try {
        logger.debug('Fetching parameters');

        const result: ApolloQueryResult<GetParameters> = await client.query<GetParameters, GetParametersVariables>({
            query: GetParametersQuery,
            fetchPolicy: 'network-only',
            variables: {
                info: {
                    version: Constants.manifest.version || 'dev',
                    os: Platform.OS === 'android' ? ParameterPlatform.android : ParameterPlatform.ios,
                },
            },
        });

        // await getPersistor().persist();

        if (result.data.getParameters != null) {
            const keys = Object.keys(ParameterName).map(
                (k) => `Parameter_${ParameterName[k as ParameterName]}`);

            await AsyncStorage.multiRemove(keys);

            if (result.data.getParameters.length > 0) {
                await AsyncStorage.multiSet(
                    result.data.getParameters.map(
                        (p) => ([`Parameter_${p.name}`, JSON.stringify(p.value)])),
                );
            }

            logger.debug('New settings are', await AsyncStorage.multiGet(keys));
        }
    } catch (e) {
        logger.error(e, 'Failed to load parameters');
    }
}
