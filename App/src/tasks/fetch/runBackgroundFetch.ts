import * as BackgroundFetch from 'expo-background-fetch';
import _ from 'lodash';
import { Audit } from "../../analytics/Audit";
import { AuditEventName } from '../../analytics/AuditEventName';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { MembersByAreasVariables } from '../../model/graphql/MembersByAreas';
import { GetAreasQuery } from "../../queries/GetAreasQuery";
import { GetAssociationsQuery } from "../../queries/GetAssociationsQuery";
import { GetClubsQuery } from '../../queries/GetClubsQuery';
import { GetMembersByAreasQuery } from "../../queries/GetMembersByAreasQuery";
import { GetOfflineMembersQuery } from '../../queries/GetOfflineMembersQuery';
import { getReduxStore } from '../../redux/getRedux';
import { FETCH_TASKNAME } from '../Constants';
import { isSignedIn } from '../isSignedIn';
import { logger } from './logger';
import { updateCache } from './updateCache';

export async function runBackgroundFetch() {
    if (await isDemoModeEnabled()) {
        logger.debug("Demonstration mode -> exit");
        return BackgroundFetch.Result.NoData;
    }

    if (!isSignedIn()) {
        logger.debug("Not signed in");
        return BackgroundFetch.Result.NoData;
    }

    const timer = Audit.timer(AuditEventName.BackgroundSync);
    try {
        logger.debug("Running");
        Audit.trackEvent(AuditEventName.BackgroundSync);

        const client = await bootstrapApollo();
        await updateCache(client, GetOfflineMembersQuery, "members");

        const areas = getReduxStore().getState().filter.member.area;
        const board = getReduxStore().getState().filter.member.showAssociationBoard;
        const areaBoard = getReduxStore().getState().filter.member.showAreaBoard;

        await updateCache(client, GetMembersByAreasQuery, "members", {
            areas: areas != null ? _(areas)
                .keys()
                .filter(k => k !== "length")
                .map(a => a.replace(/[^\d]/g, ""))
                .map(a => parseInt(a, 10))
                .value()
                : null,
            areaBoard,
            board,
        } as MembersByAreasVariables);

        await updateCache(client, GetClubsQuery, "clubs");
        await updateCache(client, GetAreasQuery, "areas");
        await updateCache(client, GetAssociationsQuery, "associations");

        const result = BackgroundFetch.Result.NewData;
        logger.debug("done", result);

        timer.submit({ [AuditPropertyNames.BackgroundFetchResult]: result.toString() });
        return result;
    }
    catch (error) {
        logger.error(error, FETCH_TASKNAME);
        timer.submit({ [AuditPropertyNames.BackgroundFetchResult]: BackgroundFetch.Result.Failed.toString() });
        return BackgroundFetch.Result.Failed;
    }
}
