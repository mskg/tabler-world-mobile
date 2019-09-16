import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { I18N } from '../../i18n/translation';
import { SettingName } from '../../model/graphql/globalTypes';
import { Pushlanguage, PushlanguageVariables } from '../../model/graphql/Pushlanguage';
import * as settingsActions from '../../redux/actions/settings';

export function* pushLanguage(_a: typeof settingsActions.storeLanguage.shape) {
    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();

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
}
