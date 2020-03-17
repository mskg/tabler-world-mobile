import { call } from 'redux-saga/effects';
import { getBadgeNumber, setBadgeNumber } from '../../helper/bagde';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { Features, isFeatureEnabled } from '../../model/Features';
import { setBadge } from '../../redux/actions/chat';
import { getReduxStore } from '../../redux/getRedux';
import { logger } from './logger';

export function* checkBadge() {
    try {
        const demo = yield call(isDemoModeEnabled);

        if (!isFeatureEnabled(Features.Chat) || demo) {
            setBadgeNumber(0);
            getReduxStore().dispatch(setBadge(0));
        } else {
            const bn = yield getBadgeNumber();
            if (bn) {
                getReduxStore().dispatch(setBadge(bn));
            }
        }
    } catch (e) {
        logger.error('badge', e);
    }
}
