import { SagaIterator } from 'redux-saga';
import { all, debounce, fork } from 'redux-saga/effects';
import * as filterActions from '../redux/actions/filter';
import { checkLinking } from './settings/checkLinking';
import { saveFavoritesToCloud } from './settings/saveFavoritesToCloud';

export function* settingsSaga(): SagaIterator {
    yield all([
        fork(checkLinking),

        // mark record as modified on favorite toggle
        debounce(2*1000, filterActions.toggleFavorite.type, saveFavoritesToCloud),
    ]);
}
