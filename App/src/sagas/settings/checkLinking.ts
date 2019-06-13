import { put } from 'redux-saga/effects';
import { LinkingHelper } from '../../helper/LinkingHelper';
import { updateSetting } from '../../redux/actions/settings';

/**
 * Check if configured apps are available
 */
export function* checkLinking() {
    const messagingApps = yield LinkingHelper.messagingApps();
    if (messagingApps.length == 0) {
        yield put(updateSetting({ name: "messagingApp", value: undefined }));
    }

    const callApps = yield LinkingHelper.callApps();
    if (callApps.length == 0) {
        yield put(updateSetting({ name: "phoneApp", value: undefined }));
    }

    const webApps = yield LinkingHelper.webApps();
    if (webApps.length == 0) {
        yield put(updateSetting({ name: "browserApp", value: undefined }));
    }

    const mailApps = yield LinkingHelper.mailApps();
    if (mailApps.length == 0) {
        yield put(updateSetting({ name: "emailApp", value: undefined }));
    }
}
