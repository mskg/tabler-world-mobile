import { AsyncStorage } from 'react-native';
import { ParameterName } from '../../model/graphql/globalTypes';
import { FetchParameterDefaults, FetchParameters } from './Fetch';
import { GeoParameters, GeoParametersDefaults } from "./Geo";
import { TimeoutDefaults, TimeoutParameters } from './Timeouts';
import { UrlDefaults, UrlParameters } from './Urls';

const defaults = {
    [ParameterName.geo]: GeoParametersDefaults,
    [ParameterName.fetch]: FetchParameterDefaults,
    [ParameterName.timeouts]: TimeoutDefaults,
    [ParameterName.urls]: UrlDefaults,
};

type AllParameterTypes =
    | GeoParameters
    | FetchParameters
    | TimeoutParameters
    | UrlParameters
    ;

export async function getParameterValue<T extends AllParameterTypes>(name: ParameterName): Promise<T> {
    const param = await AsyncStorage.getItem(`Parameter_` + name);

    // if we add new values, we need them
    return param != null
        ? {
            ...defaults[name],
            ...JSON.parse(param)
        }
        : {
            ...defaults[name]
        } as T;
}

