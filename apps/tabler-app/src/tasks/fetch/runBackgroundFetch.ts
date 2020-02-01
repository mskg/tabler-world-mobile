import * as BackgroundFetch from 'expo-background-fetch';
import { AsyncStorage } from 'react-native';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { bootstrapApollo, getPersistor } from '../../apollo/bootstrapApollo';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { FetchParameters } from '../../helper/parameters/Fetch';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { ParameterName } from '../../model/graphql/globalTypes';
import { getReduxPersistor, persistorRehydrated } from '../../redux/getRedux';
import { FETCH_LAST_DATA_RUN, FETCH_LAST_RUN } from '../Constants';
import { isSignedIn } from '../helper/isSignedIn';
import { logger } from './logger';
import { runDataUpdates } from './runDataUpdates';
import { runLocationUpdate } from './runLocationUpdate';
import { runSend } from './runSend';

export async function runBackgroundFetch() {
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
        const mininutesElapsed = (Date.now() - lastFetch) / 1000 / 60;

        await bootstrapApollo();
        await getPersistor().restore();

        const parameters = await getParameterValue<FetchParameters>(ParameterName.fetch);

        if (mininutesElapsed > parameters.dataUpdateInterval) {
            try {
                Promise.all([
                    runDataUpdates(),
                    runLocationUpdate(),
                ]);
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
        logger.error(error, 'runBackgroundFetch');

        timer.submit({
            [AuditPropertyNames.BackgroundFetchResult]: 'Failed',
        });
    } finally {
        await AsyncStorage.setItem(FETCH_LAST_RUN, Date.now().toString());

        try { await getPersistor().persist(); } catch (pe) {
            logger.error(pe, 'Could not persist apollo');
        }

        try { getReduxPersistor().flush(); } catch (pe) {
            logger.error(pe, 'Could not persist redux');
        }
    }

    return BackgroundFetch.Result.Failed;
}
