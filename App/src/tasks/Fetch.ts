import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Audit } from "../analytics/Audit";
import { AuditEventName } from '../analytics/AuditEventName';
import { bootstrapApollo, getPersistor } from '../apollo/bootstrapApollo';
import { Categories, Logger } from '../helper/Logger';
import { GetMembersQuery } from '../screens/Members/Queries';
import { GetAreasQuery, GetAssociationsQuery, GetClubsQuery } from '../screens/Structure/Queries';

const FETCH_TASKNAME = "update-contacts";
const logger = new Logger(Categories.Sagas.Fetch);
const INTERVAL = 60 * 60 * (24 / 4);

async function runBackgroundFetch() {
    const timer = Audit.timer(AuditEventName.BackgroundSync);
    try {
        logger.debug("Running");
        Audit.trackEvent(AuditEventName.BackgroundSync);

        const client = await bootstrapApollo();

        // remove for testing purposes
        // await client.cache.reset();

        await client.query({
            query: GetMembersQuery,
            fetchPolicy: "network-only",
        });
        await getPersistor().persist();

        await client.query({
            query: GetClubsQuery,
            fetchPolicy: "network-only",
        });
        await getPersistor().persist();

        await client.query({
            query: GetAreasQuery,
            fetchPolicy: "network-only",
        });
        await getPersistor().persist();

        await client.query({
            query: GetAssociationsQuery,
            fetchPolicy: "network-only",
        });
        await getPersistor().persist();

        const result = BackgroundFetch.Result.NewData;

        logger.debug("done", result);
        timer.submit({ result: result.toString() });

        return result;
    } catch (error) {
        logger.error(error, FETCH_TASKNAME);
        timer.submit({ result: BackgroundFetch.Result.Failed.toString() });

        return BackgroundFetch.Result.Failed;
    }
}

export async function registerFetchTask() {
    try {
        TaskManager.defineTask(FETCH_TASKNAME, runBackgroundFetch);

        const status = await BackgroundFetch.getStatusAsync();
        switch (status) {
            case BackgroundFetch.Status.Restricted:
            case BackgroundFetch.Status.Denied:
                logger.log("Background execution is disabled");
                return;

            default: {
                logger.debug("Background execution allowed");

                await BackgroundFetch.registerTaskAsync(FETCH_TASKNAME, {
                    minimumInterval: INTERVAL,
                    startOnBoot: true,
                    stopOnTerminate: true,
                });

                logger.debug("Registered task", FETCH_TASKNAME);
            }
        }
    } catch (e) {
        logger.error(e, "Registering of tasks failed");
    }
}