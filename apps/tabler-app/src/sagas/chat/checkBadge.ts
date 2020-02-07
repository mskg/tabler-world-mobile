import { Notifications } from 'expo';
import { Platform } from 'react-native';
import { call } from 'redux-saga/effects';
import { allowsPushNotifications } from '../../helper/allowsPushNotifications';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { Features, isFeatureEnabled } from '../../model/Features';
import { setBadge } from '../../redux/actions/chat';
import { getReduxStore } from '../../redux/getRedux';
import { logger } from './logger';

export function* checkBadge() {
    try {
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
    } catch (e) {
        logger.error(e, 'Failed to checkBadge');
    }
}
