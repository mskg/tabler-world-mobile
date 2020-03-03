import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { put, select } from 'redux-saga/effects';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { disableNearbyTablers } from '../../helper/geo/disable';
import { enableNearbyTablers } from '../../helper/geo/enable';
import { GetCloudSettings } from '../../model/graphql/GetCloudSettings';
import { IAppState } from '../../model/IAppState';
import { SettingsState } from '../../model/state/SettingsState';
import * as filterActions from '../../redux/actions/filter';
import * as settingsActions from '../../redux/actions/settings';
import { logger } from './logger';
import { NotificationSettings } from './NotificationSettings';
import { createApolloContext } from '../../helper/createApolloContext';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* restoreSettingsFromCloud(/* _a: typeof settingsActions.restoreSettings.shape */) {
    Audit.trackEvent(AuditEventName.RestoreSettings);
    logger.debug('Restoring settings');

    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();

    const result: ApolloQueryResult<GetCloudSettings> = yield client.query<GetCloudSettings>({
        query: gql`
query GetCloudSettings {
  favorites: Setting (name: favorites)
  notifications: Setting (name: notifications)
  nearbymembers: Setting (name: nearbymembers)
  nearbymembersMap: Setting (name: nearbymembersMap)
}`,
        fetchPolicy: 'network-only',
        context: createApolloContext('settings-restore'),
    });

    if (result.data.favorites != null) {
        logger.debug('Restoring favorites', result.data.favorites);
        yield put(filterActions.replaceFavorites(result.data.favorites));
    }

    const settingState: SettingsState = yield select((state: IAppState) => state.settings);

    if (settingState.nearbyMembers !== result.data.nearbymembers) {
        logger.debug('Restoring nearbyMembers', result.data.nearbymembers);

        if (result.data.nearbymembers) {
            try {
                yield enableNearbyTablers();
            } catch (e) {
                logger.error('setting-restore-nearby-enable', e);
            }
        } else {
            try {
                yield disableNearbyTablers(false);
            } catch (e) {
                logger.error('setting-restore-nearby-disable', e);
            }
        }
    }

    if (settingState.nearbyMembersMap !== result.data.nearbymembersMap) {
        logger.debug('Restoring nearbyMembersMap', result.data.nearbymembersMap);

        yield put(settingsActions.updateSetting({
            name: 'nearbyMembersMap',
            value: result.data.nearbymembersMap,
        }));
    }

    const notificationSettings: NotificationSettings = result.data?.notifications || {};

    if (settingState.notificationsBirthdays !== notificationSettings.birthdays) {
        logger.debug('Restoring notificationsBirthdays', notificationSettings.birthdays);

        yield put(settingsActions.updateSetting({
            name: 'notificationsBirthdays',
            value: notificationSettings.birthdays == null
                ? true
                : notificationSettings.birthdays,
        }));
    }

    if (settingState.notificationsOneToOneChat !== notificationSettings.personalChat) {
        logger.debug('Restoring notificationsOneToOneChat', notificationSettings.personalChat);

        yield put(settingsActions.updateSetting({
            name: 'notificationsOneToOneChat',
            value: notificationSettings.personalChat == null
                ? true
                : notificationSettings.personalChat,
        }));
    }
}
