import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { put, select } from 'redux-saga/effects';
import { IAppState } from '../../model/IAppState';
import * as settingsActions from '../../redux/actions/settings';
import { isSignedIn } from '../../tasks/helper/isSignedIn';
import { logger } from './logger';

export function* checkAndDisableNotifications() {
    try {
        const { status: existingStatus } = yield Permissions.getAsync(Permissions.NOTIFICATIONS);
        const chatDisabled = yield select((state: IAppState) => !state.settings.notificationsOneToOneChat);

        if (existingStatus !== 'granted' && !chatDisabled && Constants.isDevice && isSignedIn()) {
            yield put(settingsActions.updateSetting({
                name: 'notificationsBirthdays',
                value: false,
            }));

            yield put(settingsActions.updateSetting({
                name: 'notificationsOneToOneChat',
                value: false,
            }));
        }
    } catch (e) {
        logger.log(e, 'checkAndDisableNotifications');
    }
}
