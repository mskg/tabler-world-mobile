import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import AsyncStorage from '@react-native-community/async-storage';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { I18N } from '../../i18n/translation';
import { SettingName } from '../../model/graphql/globalTypes';
import { Pushlanguage, PushlanguageVariables } from '../../model/graphql/Pushlanguage';

const LANGUAGE_KEY = 'setting:language';

export function* pushLanguage() {
    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();

    const existingLanguage = yield AsyncStorage.getItem(LANGUAGE_KEY);
    if (existingLanguage !== I18N.id) {

        yield client.mutate<Pushlanguage, PushlanguageVariables>({
            mutation: gql`
mutation Pushlanguage($input: SettingInput!) {
    putSetting (setting: $input)
}`,
            variables: {
                input: {
                    name: SettingName.language,
                    value: I18N.id,
                },
            },
        });

        yield AsyncStorage.setItem(LANGUAGE_KEY, I18N.id);
    }
}
