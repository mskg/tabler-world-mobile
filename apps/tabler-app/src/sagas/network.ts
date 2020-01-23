import NetInfo, { NetInfoChangeHandler, NetInfoState } from '@react-native-community/netinfo';
import { eventChannel } from 'redux-saga';
import { all, call, put, take, takeLatest } from 'redux-saga/effects';
import { checkNetwork, updateNetwork } from '../redux/actions/state';
import { logger } from './state/logger';

function networkState() {
    return eventChannel((emit) => {
        logger.log('Waiting for app state changes');

        const handler: NetInfoChangeHandler = (connectionInfo) => {
            logger.log('connectionChange', connectionInfo);
            emit(connectionInfo);
        };

        return NetInfo.addEventListener(handler);
    });
}

function* storeInfo(state: NetInfoState) {
    logger.log('storeInfo', state);
    yield put(updateNetwork(state));
}

function* init() {
    const ci = yield NetInfo.fetch();
    logger.log('init', ci);

    yield put(updateNetwork(ci));
}

// tslint:disable-next-line: export-name
export function* networkSaga() {
    yield all([
        yield init(),
        yield take(checkNetwork.type),
    ]);

    const networkChannel = yield call(networkState);
    yield takeLatest(networkChannel, storeInfo);
}
