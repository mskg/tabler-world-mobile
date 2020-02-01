import _ from 'lodash';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { updateParameters } from '../../helper/parameters/updateParameters';
import { MembersByAreasVariables } from '../../model/graphql/MembersByAreas';
import { GetMembersByAreasQuery } from '../../queries/Member/GetMembersByAreasQuery';
import { GetOfflineMembersQuery } from '../../queries/Member/GetOfflineMembersQuery';
import { GetAreasQuery } from '../../queries/Structure/GetAreasQuery';
import { GetAssociationQuery } from '../../queries/Structure/GetAssociationQuery';
import { GetClubsQuery } from '../../queries/Structure/GetClubsQuery';
import { getReduxStore } from '../../redux/getRedux';
import { logger } from './logger';
import { updateCache } from './updateCache';

export async function runDataUpdates() {
    try {
        Audit.trackEvent(AuditEventName.DataUpdate);
        logger.debug('runDataUpdates');

        const client = await bootstrapApollo();

        const updateParametersPromise = updateParameters();
        const offlineMembersPromise = updateCache(client, GetOfflineMembersQuery, 'members');

        const { area, showAreaBoard, showAssociationBoard } = getReduxStore().getState().filter.member;
        const areaMembersPromise = updateCache(client, GetMembersByAreasQuery, 'members', {
            areaBoard: area != null ? showAreaBoard : null,
            board: area != null ? showAssociationBoard : null,
            areas: area != null ? _(area).keys().value() : null,
        } as MembersByAreasVariables);

        const clubsPromise = updateCache(client, GetClubsQuery, 'clubs');
        const areasPromise = updateCache(client, GetAreasQuery, 'areas');
        const associationsPromise = updateCache(client, GetAssociationQuery, 'associations');

        await Promise.all([
            updateParametersPromise,
            offlineMembersPromise,
            areaMembersPromise,
            clubsPromise,
            areasPromise,
            associationsPromise,
        ]);
    } catch (error) {
        logger.error(error, 'runDataUpdates');
    }
}
