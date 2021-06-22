import * as BackgroundFetch from 'expo-background-fetch';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-community/async-storage';
import { Categories, Logger } from '../helper/Logger';
import { Features, isFeatureEnabled } from '../model/Features';
import { FETCH_TASKNAME, LOCATION_TASK_NAME } from './Constants';
import { defineFetchTask, registerFetchTask } from './registerFetchTask';
import { registerForPushNotifications } from './registerForPushNotifications';
import { defineLocationTask, registerLocationTask } from './registerLocationTask';

const logger = new Logger(Categories.App);

const TASK_VERSION = Constants.manifest.revisionId || '0.0.0'; // Must be a string
const TASK_VERSION_KEY = 'tasks-schema-version';

// tslint:disable-next-line: export-name
export function bootstrapTasks() {
    defineFetchTask();
    defineLocationTask();
}

export async function removeTasks() {
    // this causes the fetch tasks to be reregistered
    await AsyncStorage.removeItem(FETCH_TASKNAME);

    try {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (e) {
        logger.error('bootstrap-tasks', e);
    }

    try {
        await BackgroundFetch.unregisterTaskAsync(FETCH_TASKNAME);
    } catch (e) {
        logger.error('bootstrap-tasks', e);
    }

    try {
        await TaskManager.unregisterAllTasksAsync();
    } catch (e) {
        logger.error('bootstrap-tasks', e);
    }

    // set tasks as fresh
    await AsyncStorage.setItem(TASK_VERSION_KEY, TASK_VERSION);
}

export async function runTasks() {
    const currentVersion = await AsyncStorage.getItem(TASK_VERSION_KEY);

    if (currentVersion !== TASK_VERSION) {
        logger.log('******************** REPLACING TASKS');
        await removeTasks();
    }

    await registerForPushNotifications();

    if (isFeatureEnabled(Features.BackgroundFetch)) {

        // tslint:disable-next-line: no-empty
        try { await registerFetchTask(); } catch { }
    }

    // tslint:disable-next-line: no-empty
    try { await registerLocationTask(); } catch { }
}
