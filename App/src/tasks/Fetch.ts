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

        const q1 = client.query({
            query: GetMembersQuery,
            fetchPolicy: "network-only",
        });

        const q2 =  client.query({
            query: GetClubsQuery,
            fetchPolicy: "network-only",
        });

        const q3 =  client.query({
            query: GetAreasQuery,
            fetchPolicy: "network-only",
        });

        const q4 =  client.query({
            query: GetAssociationsQuery,
            fetchPolicy: "network-only",
        });

        await Promise.all([q1,q2,q3,q4]);
        await getPersistor().persist();

        const result = BackgroundFetch.Result.NewData;

        logger.debug("done", result);
        timer.submit({ result: result.toString() });

        return result;
    } catch (error) {
        logger.error(error, FETCH_TASKNAME);
        timer.submit({ result: BackgroundFetch.Result.Failed });

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

                let tasks = await TaskManager.getRegisteredTasksAsync();
                if (tasks.find(f => f.taskName === FETCH_TASKNAME) == null) {
                    logger.log("Registering task");
                    await BackgroundFetch.registerTaskAsync(FETCH_TASKNAME);

                    tasks = await TaskManager.getRegisteredTasksAsync();
                    logger.debug("Registered tasks", tasks);
                } else {
                    logger.log(`Task ${FETCH_TASKNAME} already registered, skipping`);
                }

                logger.log("Setting interval to", INTERVAL);
                await BackgroundFetch.setMinimumIntervalAsync(INTERVAL);
            }
        }
    } catch (e) {
        logger.error(e, "Registering of tasks failed");
    }
}