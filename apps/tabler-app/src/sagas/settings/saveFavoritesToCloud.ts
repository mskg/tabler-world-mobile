import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { select } from 'redux-saga/effects';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { MetricNames } from '../../analytics/MetricNames';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { SettingName } from '../../model/graphql/globalTypes';
import { SaveFavorites, SaveFavoritesVariables } from '../../model/graphql/SaveFavorites';
import { IAppState } from '../../model/IAppState';
import { HashMap } from '../../model/Maps';
import { GetFavoriteMembersQuery } from '../../queries/GetFavoriteMembersQuery';
import * as filterActions from '../../redux/actions/filter';
import { logger } from './logger';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* saveFavoritesToCloud(_a: typeof filterActions.toggleFavorite.shape) {
    const favorites: HashMap<boolean> = yield select(
        (state: IAppState) => state.filter.member.favorites);

    Audit.trackEvent(AuditEventName.SaveFavorites, undefined, {
        [MetricNames.NumerofFavorites]: Object.keys(favorites).length,
    });

    const result = Object
        .keys(favorites)
        .map((f) => parseInt(f, 10))
        .filter((f) => !isNaN(f) && typeof (f) === 'number');

    logger.debug(favorites, result);

    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();
    yield client.mutate<SaveFavorites, SaveFavoritesVariables>({
        mutation: gql`
mutation SaveFavorites($input: SettingInput!) {
    putSetting (setting: $input)
}`,
        variables: {
            input: {
                name: SettingName.favorites,
                value: result,
            },
        },

        awaitRefetchQueries: false,
        refetchQueries: [{
            query: GetFavoriteMembersQuery,
        }],
    });
}
