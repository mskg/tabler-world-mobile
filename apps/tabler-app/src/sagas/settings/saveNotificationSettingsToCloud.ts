import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { select } from 'redux-saga/effects';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { SettingName } from '../../model/graphql/globalTypes';
import { SaveNotificationSettings, SaveNotificationSettingsVariables } from '../../model/graphql/SaveNotificationSettings';
import { IAppState } from '../../model/IAppState';
import { SettingsState } from '../../model/state/SettingsState';
import * as settingsActions from '../../redux/actions/settings';
import { NotificationSettings } from './NotificationSettings';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* saveNotificationSettingsToCloud(setting: typeof settingsActions.updateSetting.shape) {

    if (setting.payload.name !== 'notificationsBirthdays'
        && setting.payload.name !== 'notificationsOneToOneChat') {
        return;
    }

    const settings: SettingsState = yield select(
        (state: IAppState) => state.settings);

    Audit.trackEvent(AuditEventName.SaveNotificationSettings);

    const result: NotificationSettings = {
        birthdays: settings.notificationsBirthdays == null
            ? true : settings.notificationsBirthdays,
        personalChat: settings.notificationsOneToOneChat == null
            ? true : settings.notificationsOneToOneChat,
    };

    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();
    yield client.mutate<SaveNotificationSettings, SaveNotificationSettingsVariables>({
        mutation: gql`
mutation SaveNotificationSettings($input: SettingInput!) {
    putSetting (setting: $input)
}`,
        variables: {
            input: {
                name: SettingName.notifications,
                value: result,
            },
        },

        // awaitRefetchQueries: false,
        // refetchQueries: [{
        //     query: GetFavoriteMembersQuery,
        // }],
    });
}
