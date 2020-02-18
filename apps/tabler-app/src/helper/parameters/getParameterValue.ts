import { defaultParamters, FetchParameters, GeocodingParameters, GeoParameters, TimeoutParameters, UrlParameters } from '@mskg/tabler-world-config-app';
import { AsyncStorage } from 'react-native';
import { ParameterName } from '../../model/graphql/globalTypes';

const defaults = {
    [ParameterName.geo]: defaultParamters.geo,
    [ParameterName.fetch]: defaultParamters.fetch,
    [ParameterName.timeouts]: defaultParamters.timeouts,
    [ParameterName.urls]: defaultParamters.urls,
    [ParameterName.geocoding]: defaultParamters.geocoding,
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
