import { SagaIterator } from 'redux-saga';
import { all, debounce, fork, takeLatest } from 'redux-saga/effects';
import * as filterActions from '../redux/actions/filter';
import * as settingsActions from '../redux/actions/settings';
import { checkLinking } from './settings/checkLinking';
import { pushLanguage } from './settings/pushLanguage';
import { restoreSettingsFromCloud } from './settings/restoreSettingsFromCloud';
import { saveFavoritesToCloud } from './settings/saveFavoritesToCloud';

export function* settingsSaga(): SagaIterator {
    yield all([
        fork(checkLinking),

        // restore settings
        takeLatest(settingsActions.restoreSettings.type, restoreSettingsFromCloud),
        takeLatest(settingsActions.storeLanguage.type, pushLanguage),

        // mark record as modified on favorite toggle
        debounce(2 * 1000, [filterActions.toggleFavorite.type, filterActions.addFavorite.type, filterActions.removeFavorite.type], saveFavoritesToCloud),
        // takeLatest(settingsActions.updateSetting.type, checkLocationTask),
    ]);
}
