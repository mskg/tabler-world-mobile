import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { OperationVariables } from 'apollo-client';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { DocumentNode } from 'graphql';
import _ from 'lodash';
import { Audit } from "../analytics/Audit";
import { AuditEventName } from '../analytics/AuditEventName';
import { AuditPropertyNames } from '../analytics/AuditPropertyNames';
import { bootstrapApollo, getPersistor } from '../apollo/bootstrapApollo';
import { MaxTTL } from '../helper/cache/withCacheInvalidation';
import { Categories, Logger } from '../helper/Logger';
import { MembersByAreasVariables } from '../model/graphql/MembersByAreas';
import { GetAreasQuery } from "../queries/GetAreasQuery";
import { GetAssociationsQuery } from "../queries/GetAssociationsQuery";
import { GetClubsQuery } from '../queries/GetClubsQuery';
import { GetMembersByAreasQuery } from "../queries/GetMembersByAreasQuery";
import { GetOfflineMembersQuery } from '../queries/GetOfflineMembersQuery';
import { getReduxStore } from '../redux/getRedux';

const FETCH_TASKNAME = "update-contacts";
const logger = new Logger(Categories.Sagas.Fetch);
const INTERVAL = 60 * 60 * (24 / 4);

async function updateCache(client: ApolloClient<NormalizedCacheObject>, query: DocumentNode, field: keyof typeof MaxTTL, variables?: OperationVariables) {
    logger.log("Fetching", field);

    await client.query({
        query,
        fetchPolicy: "network-only",
        variables,
    });

    await client.writeData({
        data: {
            LastSync: {
                __typename: 'LastSync',
                [field]: Date.now()
            }
        },
    });

    await getPersistor().persist();
}

async function runBackgroundFetch() {
    const timer = Audit.timer(AuditEventName.BackgroundSync);
    try {
        logger.debug("Running");
        Audit.trackEvent(AuditEventName.BackgroundSync);

        const client = await bootstrapApollo();

        await updateCache(client, GetOfflineMembersQuery, "members");

        const areas = getReduxStore().getState().filter.member.area;
        await updateCache(client, GetMembersByAreasQuery, "members", {
            areas: areas != null ? _(areas)
                .keys()
                .filter(k => k !== "length")
                .map(a => a.replace(/[^\d]/g, ""))
                .map(a => parseInt(a, 10))
                .value()
                : null
        } as MembersByAreasVariables);

        await updateCache(client, GetClubsQuery, "clubs");
        await updateCache(client, GetAreasQuery, "areas");
        await updateCache(client, GetAssociationsQuery, "associations");

        const result = BackgroundFetch.Result.NewData;

        logger.debug("done", result);
        timer.submit({ [AuditPropertyNames.BackgroundFetchResult]: result.toString() });

        return result;
    } catch (error) {
        logger.error(error, FETCH_TASKNAME);
        timer.submit({ [AuditPropertyNames.BackgroundFetchResult]: BackgroundFetch.Result.Failed.toString() });

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