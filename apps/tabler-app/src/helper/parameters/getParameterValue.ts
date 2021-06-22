import { defaultParameters, FetchParameters, GeocodingParameters, GeoParameters, TimeoutParameters, UrlParameters } from '@mskg/tabler-world-config-app';
import AsyncStorage from '@react-native-community/async-storage';
import { ParameterName } from '../../model/graphql/globalTypes';

const defaults = {
    [ParameterName.geo]: defaultParameters.geo,
    [ParameterName.fetch]: defaultParameters.fetch,
    [ParameterName.timeouts]: defaultParameters.timeouts,
    [ParameterName.urls]: defaultParameters.urls,
    [ParameterName.geocoding]: defaultParameters.geocoding,
};

type AllParameterTypes =
    | GeoParameters
    | FetchParameters
    | TimeoutParameters
    | UrlParameters
    | GeocodingParameters
    ;

export async function getParameterValue<T extends AllParameterTypes>(name: ParameterName): Promise<T> {
    const param = await AsyncStorage.getItem(`Parameter_${name}`);

    // if we add new values, we need them
    return param != null
        ? {
            ...defaults[name],
            ...JSON.parse(param),
        }
        : {
            ...defaults[name],
        } as T;
}
