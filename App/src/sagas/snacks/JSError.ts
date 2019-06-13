import { put } from 'redux-saga/effects';
import { I18N } from '../../i18n/translation';
import * as snackActions from '../../redux/actions/snacks';
import { logger } from './logger';

/**
 * Fetch all tablers throug the API
 */
export function* jsOfflineError(action: any) {
    logger.error(action);

    yield put(snackActions.addSnack({
        message: I18N.SnackBar.error(action.paylopad || action),
    }));
}
