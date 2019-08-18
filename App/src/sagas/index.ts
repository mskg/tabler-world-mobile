import { END, eventChannel } from 'redux-saga';
import { call, spawn } from 'redux-saga/effects';
import { Categories, Logger } from '../helper/Logger';
import { networkSaga } from './network';
import { getParameters } from './parameters/getParameters';
import { pushTokenSaga } from './pushTokenSaga';
import { settingsSaga } from './settingsSaga';
import { appStateSaga } from './state';
import { userSaga } from './userSaga';

const logger = new Logger(Categories.SagaRoot);

function persistGate(persistor) {
  return eventChannel(emit => {
    const handler = () => {
      logger.log("state changed");
      let { bootstrapped } = persistor.getState();

      if (bootstrapped) {
        emit(true);
        emit(END);
      }
    }

    return persistor.subscribe(handler);
  });
}

// https://redux-saga.js.org/docs/advanced/RootSaga.html
// This strategy maps our child sagas to spawned generators detaching them from the root parent) which start our sagas as
// subtasks in a try block. Our saga will run until termination, and then be automatically restarted. The catch block
// harmlessly handles any error that may have been thrown by, and terminated, our saga.
export function* rootSaga() {
  logger.debug("Startup");

  // logger.log("Waiting for rehydration");
  // const persistor = getReduxPersistor();
  // const persistChannel = yield call(persistGate, persistor);
  // yield take(persistChannel);
  // logger.log("Rehydrated");

  const sagas = [
    userSaga,
    pushTokenSaga,
    settingsSaga,
    appStateSaga,
    networkSaga,
    getParameters,
  ];

  yield* sagas.map(saga =>
    spawn(function* () {
      while (true) { // restart on error
        try {
          yield call(saga);
          break; // stop when done
        } catch (e) {
          logger.error(e);
        }
      }
    })
  );
}
