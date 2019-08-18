
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { PersistConfig, persistReducer, persistStore } from "redux-persist";
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { Categories, Logger } from '../helper/Logger';
import { IAppState } from '../model/IAppState';
import { navMiddleware, navReducer } from "../navigation/redux";
import { setReduxPersistor, setReduxStore, setSagaMiddleware } from './getRedux';
import { INITIAL_STATE } from './initialState';
import { migrateToNull, MIGRATE_VERSION } from './migrations';
import reducers from './reducers';

const logger = new Logger(Categories.Redux);

export function bootstrapRedux() {
  const sagaMiddleware = createSagaMiddleware();
  setSagaMiddleware(sagaMiddleware);

  const persistConfig: PersistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
    blacklist: ["snacks", "updateAvailable", "members", "localSync", "offline"],

    version: MIGRATE_VERSION,
    migrate: migrateToNull
  };

  // this breaks the experimental navigation option in DEV!
  if (true || !__DEV__) {
    persistConfig.blacklist = [...(persistConfig.blacklist || []), "navigation"];
  }

  const appReducer = persistReducer(persistConfig, combineReducers<IAppState>(
    {
      ...reducers,

      //@ts-ignore
      navigation: navReducer,
    }));


  const clearReducer = (state, action) => {
    if (action.type === '__CLEAR__ALL__') {
      logger.log("********** DESTROYING STATE **********")

      // https://github.com/rt2zz/redux-persist/issues/845
      Object.keys(state).forEach(key => {
        storage.removeItem(`persist:${key}`);
      });

      state = Object.assign({}, INITIAL_STATE);
    } else if (action.type === 'RESET_STORE') {
      state = Object.assign({}, INITIAL_STATE);
    }

    return appReducer(state, action)
  }

  const reduxLogger = store => next => action => {
    logger.debug(action.type, action.key);
    let result = next(action)
    return result
  }

  // console.log(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__);
  // const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(
    clearReducer,
    //@ts-ignore
    INITIAL_STATE,
    compose(
      applyMiddleware(
        reduxLogger,
        navMiddleware,
        sagaMiddleware
      )
    ),
  );

  setReduxStore(store);

  const persistor = persistStore(store);
  setReduxPersistor(persistor);
}