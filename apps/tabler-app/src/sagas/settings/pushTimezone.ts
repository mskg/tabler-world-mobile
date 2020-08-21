import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import AsyncStorage from '@react-native-community/async-storage';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { I18N } from '../../i18n/translation';
import { SettingName } from '../../model/graphql/globalTypes';
import { PushTimezone, PushTimezoneVariables } from '../../model/graphql/PushTimezone';

const TIMEZONE_KEY = 'setting:timezone';

export function* pushTimezone() {
    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();

    const kownTimezone = yield AsyncStorage.getItem(TIMEZONE_KEY);
    const value = I18N.timezone;

    if (kownTimezone !== value) {
        yield client.mutate<PushTimezone, PushTimezoneVariables>({
            mutation: gql`
mutation PushTimezone($input: SettingInput!) {
    putSetting (setting: $input)
}`,
            variables: {
                input: {
                    value,
                    name: SettingName.timezone,
                },
            },
        });

        yield AsyncStorage.setItem(TIMEZONE_KEY, value);
    }
}
