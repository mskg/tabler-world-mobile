
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { Categories, Logger } from '../helper/Logger';
import { IAppState } from '../model/IAppState';
import { navMiddleware, navReducer } from '../navigation/redux';
import { setReduxPersistor, setReduxStore, setSagaMiddleware } from './getRedux';
import { INITIAL_STATE } from './initialState';
import { migrateToNull, MIGRATE_VERSION } from './migrations';
import reducers from './reducers';

const logger = new Logger(Categories.Redux);

export function bootstrapRedux() {
    const sagaMiddleware = createSagaMiddleware();
    setSagaMiddleware(sagaMiddleware);

    const persistConfig: PersistConfig = {
        storage,
        key: 'root',
        stateReconciler: autoMergeLevel2,

        blacklist: ['snacks', 'updateAvailable', 'connection'],

        version: MIGRATE_VERSION,
        migrate: migrateToNull,
    };

    // this breaks the experimental navigation option in DEV!
    if (true || !__DEV__) {
        persistConfig.blacklist = [...(persistConfig.blacklist || []), 'navigation'];
    }

    const appReducer = persistReducer(persistConfig, combineReducers<IAppState>(
        {
            ...reducers,

            // @ts-ignore navigation is not part of the state and removed
            navigation: navReducer,
        }));


    const clearReducer = (state, action) => {
        let newState = state;

        if (action.type === '__CLEAR__ALL__') {
            logger.log('********** DESTROYING STATE **********');

            // https://github.com/rt2zz/redux-persist/issues/845
            Object.keys(state).forEach(key => {
                storage.removeItem(`persist:${key}`);
            });

            newState = Object.assign({}, INITIAL_STATE);
        } else if (action.type === 'RESET_STORE') {
            newState = Object.assign({}, INITIAL_STATE);
        }

        return appReducer(newState, action);
    };

    const reduxLogger = (_store) => (next) => (action) => {
        logger.debug(action.type, action.key);
        return next(action);
    };

    const store = createStore(
        clearReducer,
        // @ts-ignore types are compatible
        INITIAL_STATE,
        compose(
            applyMiddleware(
                reduxLogger,
                navMiddleware,
                sagaMiddleware,
            ),
        ),
    );

    setReduxStore(store);

    const persistor = persistStore(store);
    setReduxPersistor(persistor);
}
