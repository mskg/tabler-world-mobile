import { SagaIterator } from 'redux-saga';
import { all, debounce, fork, takeEvery, takeLatest } from 'redux-saga/effects';
import * as filterActions from '../redux/actions/filter';
import * as settingsActions from '../redux/actions/settings';
import { checkAndDisableNotifications } from './settings/checkAndDisableNotifications';
import { checkLinking } from './settings/checkLinking';
import { restoreSettingsFromCloud } from './settings/restoreSettingsFromCloud';
import { saveFavoritesToCloud } from './settings/saveFavoritesToCloud';
import { saveNotificationSettingsToCloud } from './settings/saveNotificationSettingsToCloud';
import { waitRetry } from './waitRetry';

export function* settingsSaga(): SagaIterator {
    yield all([
        fork(checkLinking),
        fork(checkAndDisableNotifications),

        // restore settings
        takeLatest(
            settingsActions.restoreSettings.type,
            waitRetry(restoreSettingsFromCloud),
        ),

        // mark record as modified on favorite toggle
        debounce(
            2 * 1000,
            [
                filterActions.toggleFavorite.type,
                filterActions.addFavorite.type,
                filterActions.removeFavorite.type,
            ],
            waitRetry(saveFavoritesToCloud),
        ),

        takeEvery(
            settingsActions.updateSetting.type,
            waitRetry(saveNotificationSettingsToCloud),
        ),
    ]);
}
