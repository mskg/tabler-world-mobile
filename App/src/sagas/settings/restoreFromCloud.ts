import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { put } from 'redux-saga/effects';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { GetFavoritesSetting } from '../../model/graphql/GetFavoritesSetting';
import * as filterActions from '../../redux/actions/filter';
import * as settingsActions from '../../redux/actions/settings';
import { logger } from './logger';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* restoreSettingsFromCloud(a: typeof settingsActions.restoreSettings.shape) {
    Audit.trackEvent(AuditEventName.RestoreSettings);
    logger.debug('Restoring settings');

    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();

    const result: ApolloQueryResult<GetFavoritesSetting> = yield client.query<GetFavoritesSetting>({
        query: gql`
query GetFavoritesSetting {
  Setting (name: favorites)
}`,
        fetchPolicy: 'network-only',
    });

    if (result.data.Setting != null) {
        logger.debug('Restoring favorites', result);
        yield put(filterActions.replaceFavorites(result.data.Setting));
    }
}
