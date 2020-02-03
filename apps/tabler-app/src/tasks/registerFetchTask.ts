import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { FetchParameters } from '../helper/parameters/Fetch';
import { getParameterValue } from '../helper/parameters/getParameterValue';
import { ParameterName } from '../model/graphql/globalTypes';
import { FETCH_TASKNAME } from './Constants';
import { logger } from './fetch/logger';
import { runFetchTask } from './fetch/runFetchTask';

export async function registerFetchTask() {
    try {
        TaskManager.defineTask(FETCH_TASKNAME, runFetchTask);

        const status = await BackgroundFetch.getStatusAsync();
        switch (status) {
            case BackgroundFetch.Status.Restricted:
            case BackgroundFetch.Status.Denied:
                logger.log('Background execution is disabled');
                return;

            default: {
                logger.debug('Background execution allowed');

                const settings = await getParameterValue<FetchParameters>(ParameterName.fetch);
                await BackgroundFetch.registerTaskAsync(FETCH_TASKNAME, settings.task);

                logger.debug('Registered task', FETCH_TASKNAME);
            }
        }
    } catch (e) {
        logger.error(e, 'Registering of tasks failed');
    }
}
