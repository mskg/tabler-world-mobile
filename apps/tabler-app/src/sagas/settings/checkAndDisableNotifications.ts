import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { put, select } from 'redux-saga/effects';
import { IAppState } from '../../model/IAppState';
import * as settingsActions from '../../redux/actions/settings';

export function* checkAndDisableNotifications() {
    const { status: existingStatus } = yield Permissions.getAsync(Permissions.NOTIFICATIONS);
    const chatDisabled = yield select((state: IAppState) => !state.settings.notificationsOneToOneChat);

    if (existingStatus !== 'granted' && !chatDisabled && Constants.isDevice) {
        yield put(settingsActions.updateSetting({
            name: 'notificationsBirthdays',
            value: false,
        }));

        yield put(settingsActions.updateSetting({
            name: 'notificationsOneToOneChat',
            value: false,
        }));
    }
}
