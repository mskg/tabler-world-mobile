import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { put } from 'redux-saga/effects';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { GetCloudSettings } from '../../model/graphql/GetCloudSettings';
import * as filterActions from '../../redux/actions/filter';
import * as settingsActions from '../../redux/actions/settings';
import { logger } from './logger';
import { NotificationSettings } from './NotificationSettings';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* restoreSettingsFromCloud(_a: typeof settingsActions.restoreSettings.shape) {
    Audit.trackEvent(AuditEventName.RestoreSettings);
    logger.debug('Restoring settings');

    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();

    const result: ApolloQueryResult<GetCloudSettings> = yield client.query<GetCloudSettings>({
        query: gql`
query GetCloudSettings {
  favorites: Setting (name: favorites)
  notifications: Setting (name: notifications)
}`,
        fetchPolicy: 'network-only',
    });

    if (result.data.favorites != null) {
        logger.debug('Restoring favorites', result.data.favorites);
        yield put(filterActions.replaceFavorites(result.data.favorites));
    }

    const notificationSettings: NotificationSettings = result.data?.notifications || {};

    yield put(settingsActions.updateSetting({
        name: 'notificationsBirthdays',
        value: notificationSettings.birthdays == null
            ? true
            : notificationSettings.birthdays,
    }));

    yield put(settingsActions.updateSetting({
        name: 'notificationsOneToOneChat',
        value: notificationSettings.personalChat == null
            ? true
            : notificationSettings.personalChat,
    }));
}
