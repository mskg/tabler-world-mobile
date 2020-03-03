import { FetchParameters } from '@mskg/tabler-world-config-app';
import * as BackgroundFetch from 'expo-background-fetch';
import { AsyncStorage } from 'react-native';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { bootstrapApollo, getApolloCachePersistor } from '../../apollo/bootstrapApollo';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { ParameterName } from '../../model/graphql/globalTypes';
import { getReduxPersistor, persistorRehydrated } from '../../redux/getRedux';
import { FETCH_LAST_DATA_RUN, FETCH_LAST_RUN } from '../Constants';
import { isSignedIn } from '../helper/isSignedIn';
import { isLocationTaskEnabled } from '../location/isLocationTaskEnabled';
import { updateLocation } from '../location/updateLocation';
import { logger } from './logger';
import { runDataUpdates } from './runDataUpdates';
import { runSend } from './runSend';

export async function runFetchTask() {
    if (await isDemoModeEnabled()) {
        logger.debug('Demonstration mode -> exit');
        return BackgroundFetch.Result.NoData;
    }

    await persistorRehydrated();
    if (!isSignedIn()) {
        logger.debug('Not signed in');
        return BackgroundFetch.Result.NoData;
    }

    const timer = Audit.timer(AuditEventName.BackgroundSync);
    try {
        const lastFetch = parseInt(await AsyncStorage.getItem(FETCH_LAST_DATA_RUN) || '0', 10);
        const minutesElapsed = (Date.now() - lastFetch) / 1000 / 60;

        logger.debug('Bootstrapping apollo');
        await bootstrapApollo({ noWebsocket: true });
        await getApolloCachePersistor().restore();

        const parameters = await getParameterValue<FetchParameters>(ParameterName.fetch);

        if (minutesElapsed > parameters.dataUpdateInterval) {
            try {
                const promises: Promise<any>[] = [runDataUpdates()];

                const locationEnabled = await isLocationTaskEnabled();
                if (locationEnabled) {
                    promises.push(updateLocation(false, true));
                }

                await Promise.all(promises);
            } finally {
                await AsyncStorage.setItem(FETCH_LAST_DATA_RUN, Date.now().toString());
            }
        }

        await runSend();

        timer.submit({
            [AuditPropertyNames.BackgroundFetchResult]: 'OK',
        });

        logger.debug('done');
        return BackgroundFetch.Result.NewData;
    } catch (error) {
        logger.error('task-fetch-run', error);

        timer.submit({
            [AuditPropertyNames.BackgroundFetchResult]: 'Failed',
        });
    } finally {
        await AsyncStorage.setItem(FETCH_LAST_RUN, Date.now().toString());

        try { await getApolloCachePersistor().persist(); } catch (pe) {
            logger.error('task-fetch-persist', pe);
        }

        try { getReduxPersistor().flush(); } catch (pe) {
            logger.error('task-fetch-persist', pe);
        }
    }

    return BackgroundFetch.Result.Failed;
}
