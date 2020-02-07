import { Notifications } from 'expo';
import { setBadge } from '../../redux/actions/chat';
import { getReduxStore } from '../../redux/getRedux';
import { isFeatureEnabled, Features } from '../../model/Features';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { allowsPushNotifications } from '../../helper/allowsPushNotifications';
import { call } from 'redux-saga/effects';
import { Platform } from 'react-native';

export function* checkBadge() {
    const notifications = yield allowsPushNotifications();
    const demo = yield call(isDemoModeEnabled);

    if (!isFeatureEnabled(Features.Chat) || demo) {
        if (Platform.OS === 'ios' && notifications) { yield Notifications.setBadgeNumberAsync(0); }
        getReduxStore().dispatch(setBadge(0));
    } else {
        if (Platform.OS === 'ios' && notifications) {
            const unread = yield Notifications.getBadgeNumberAsync();
            getReduxStore().dispatch(setBadge(unread));
        }
    }
}
