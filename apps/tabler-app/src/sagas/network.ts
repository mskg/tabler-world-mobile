import { ConnectionInfo, ConnectionType, NetInfo } from 'react-native';
import { eventChannel } from 'redux-saga';
import { all, call, put, take, takeLatest } from 'redux-saga/effects';
import { checkNetwork, updateNetwork } from '../redux/actions/state';
import { logger } from './state/logger';

function networkState() {
    return eventChannel((emit) => {
        logger.log('Waiting for app state changes');

        const handler = (connectionInfo: ConnectionInfo | ConnectionType) => {
            logger.log('connectionChange', connectionInfo);
            emit(connectionInfo);
        };

        const listener = NetInfo.addEventListener('connectionChange', handler);
        return () => listener.remove();
    });
}

function* storeInfo(state: ConnectionInfo) {
    logger.log('storeInfo', state);
    yield put(updateNetwork(state));
}

function* init() {
    const ci = yield NetInfo.getConnectionInfo();
    logger.log('init', ci);

    yield put(updateNetwork(ci));
}

// tslint:disable-next-line: export-name
export function* networkSaga() {
    yield all([
        yield init(),
        yield take(checkNetwork),
    ]);

    const networkChannel = yield call(networkState);
    yield takeLatest(networkChannel, storeInfo);
}
