import { FetchParameters } from '@mskg/tabler-world-config-app';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { AsyncStorage } from 'react-native';
import { getParameterValue } from '../helper/parameters/getParameterValue';
import { ParameterName } from '../model/graphql/globalTypes';
import { FETCH_TASKNAME } from './Constants';
import { logger } from './fetch/logger';
import { runFetchTask } from './fetch/runFetchTask';

export function defineFetchTask() {
    TaskManager.defineTask(FETCH_TASKNAME, runFetchTask);
}

export async function registerFetchTask() {
    try {
        const status = await BackgroundFetch.getStatusAsync();
        switch (status) {
            case BackgroundFetch.Status.Denied:
                logger.log('Background execution is disabled');
                return;

            default: {
                logger.debug('Background execution allowed');
                const settings = await getParameterValue<FetchParameters>(ParameterName.fetch);

                const started = await AsyncStorage.getItem(FETCH_TASKNAME);
                if (started) {
                    logger.debug(FETCH_TASKNAME, 'already started.');

                    await BackgroundFetch.setMinimumIntervalAsync(settings.task.minimumInterval);
                    return;
                }

                await BackgroundFetch.registerTaskAsync(FETCH_TASKNAME, settings.task);
                await BackgroundFetch.setMinimumIntervalAsync(settings.task.minimumInterval);
                await AsyncStorage.setItem(FETCH_TASKNAME, true.toString());

                logger.debug('Registered task', FETCH_TASKNAME);
            }
        }
    } catch (e) {
        logger.error('task-fetch-register', e);
    }
}
