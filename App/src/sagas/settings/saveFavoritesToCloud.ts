import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { select } from 'redux-saga/effects';
import { Audit } from "../../analytics/Audit";
import { AuditEventName } from '../../analytics/AuditEventName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { IAppState } from '../../model/IAppState';
import { HashMap } from '../../model/Maps';
import * as filterActions from '../../redux/actions/filter';
import { logger } from './logger';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* saveFavoritesToCloud(a: typeof filterActions.toggleFavorite.shape) {
    const favorites: HashMap<boolean> = yield select(
        (state: IAppState) => state.filter.member.favorites);

    Audit.trackEvent(AuditEventName.SaveFavorites, undefined, {
        count: Object.keys(favorites).length,
    });

    const result = Object
        .keys(favorites)
        .map(f => parseInt(f, 10))
        .filter(f => f != NaN && typeof (f) === "number");

    logger.debug(favorites, result);

    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();
    yield client.mutate({
        mutation: gql`
mutation PutSetting($input: SettingInput!) {
    putSetting (setting: $input)
}`,
        variables: {
            input: {
                name: "favorites",
                value: result,
            }
        },
    });

    // yield put(saveFavorites(Object.keys(favorites).map(e => parseInt(e, 10))));
}
