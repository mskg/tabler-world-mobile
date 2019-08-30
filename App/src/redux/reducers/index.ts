import { PersistConfig, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import { Features, isFeatureEnabled } from '../../model/Features';
import { migrateToNull, MIGRATE_VERSION } from '../migrations';
import { EncryptedFileStorage } from '../persistor/EncryptedFileStorage';
import { filterReducer } from './filter';
import { searchHistoryReducer } from './history';
import { locationReducer } from './location';
import { networkReducer } from './network';
import { settingsReducer } from './settings';
import { snackReducer } from './snacks';
import { stateReducer } from './state';
import { userReducer } from './user';

const authUserConfig: PersistConfig = {
    key: 'auth',
    keyPrefix: '',
    blacklist: ["signinState"],

    // storage: encryptedStorage,
    storage: isFeatureEnabled(Features.EncryptedStorage)
        ? EncryptedFileStorage()
        : storage,

    timeout: 0,

    version: MIGRATE_VERSION,
    migrate: migrateToNull,
    debug: __DEV__,
};

const defaultConfig = {
    storage,
    stateReconciler: autoMergeLevel2,
    // whitelist: ["_persist"],

    timeout: 0,
    // version: MIGRATE_VERSION,
    debug: __DEV__,

    version: MIGRATE_VERSION,
    migrate: migrateToNull,
};

export default {
    connection: networkReducer,
    updateAvailable: stateReducer,

    auth: persistReducer(authUserConfig, userReducer),

    searchHistory: persistReducer({
        ...defaultConfig,
        key: "searchHistory",
    }, searchHistoryReducer),

    settings: persistReducer({
        ...defaultConfig,
        key: "settings",
    }, settingsReducer),

    filter: persistReducer({
        ...defaultConfig,
        key: "filter",
    }, filterReducer),

    location: persistReducer({
        ...defaultConfig,
        key: "location",
    }, locationReducer),

    snacks: snackReducer,
};
