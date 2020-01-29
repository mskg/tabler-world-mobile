import { FetchPolicy } from 'apollo-client';
import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { RefreshTracker } from '../../components/RefreshTracker';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { MembersByAreas, MembersByAreasVariables } from '../../model/graphql/MembersByAreas';
import { OfflineMembers } from '../../model/graphql/OfflineMembers';
import { IAppState } from '../../model/IAppState';
import { HashMap } from '../../model/Maps';
import { GetMembersByAreasQuery } from '../../queries/Member/GetMembersByAreasQuery';
import { GetOfflineMembersQuery } from '../../queries/Member/GetOfflineMembersQuery';
import { MemberScreen as ConnectedMemberScreen } from './MemberScreen';

type Props = {
    fetchPolicy: FetchPolicy,
    areas: HashMap<boolean, string> | null;
    showAssociationBoard: boolean;
    showAreaBoard: boolean;
    offline: boolean;
};

// tslint:disable-next-line: max-classes-per-file
class MembersQueryBase extends React.Component<Props> {
    render() {
        return (
            <RefreshTracker>
                {({ isRefreshing, createRunRefresh }) => {
                    return (
                        <Query<OfflineMembers>
                            query={GetOfflineMembersQuery}
                            fetchPolicy={this.props.fetchPolicy}
                        >
                            {({ loading: oLoading, data: oData, error: oError, refetch: oRefetch }) => {
                                if (!oLoading && (oData == null || oData.OwnTable == null || oData.FavoriteMembers == null)) {
                                    if (this.props.offline) {
                                        return <CannotLoadWhileOffline />;
                                    }

                                    setTimeout(createRunRefresh(oRefetch));
                                }

                                return (
                                    <Query<MembersByAreas, MembersByAreasVariables>
                                        query={GetMembersByAreasQuery}
                                        fetchPolicy={this.props.fetchPolicy}
                                        variables={{
                                            areas: this.props.areas != null ? _(this.props.areas).keys().value() : null,
                                            board: this.props.showAssociationBoard,
                                            areaBoard: this.props.showAreaBoard,
                                        }}
                                    >
                                        {({ loading, data, error, refetch }) => {
                                            // if (!loading && !oLoading && loadingState.isLoading && !loadingState.isRefreshing) {
                                            //     setTimeout(() => setLoading(false));
                                            // }

                                            if (error || oError) throw (error || oError);
                                            if (!loading && (data == null || data.MembersOverview == null)) {
                                                setTimeout(createRunRefresh(refetch));
                                            }

                                            return (
                                                <ConnectedMemberScreen
                                                    loading={loading || isRefreshing}
                                                    data={data}
                                                    offlineData={oData}
                                                    refresh={createRunRefresh(() => Promise.all([refetch(), oRefetch()]))}
                                                />
                                            );
                                        }}
                                    </Query>
                                );
                            }}
                        </Query>
                    );
                }}
            </RefreshTracker>

        );
    }
}

const MembersQueryWithCacheInvalidation = connect(
    (s: IAppState) => ({
        areas: s.filter.member.area,
        showAssociationBoard: s.filter.member.showAssociationBoard,
        showAreaBoard: s.filter.member.showAreaBoard,
        offline: s.connection.offline,
    }),
)(
    withCacheInvalidation(
        'members',
        MembersQueryBase,
    ),
);

// tslint:disable-next-line: export-name
export const MembersScreen = withWhoopsErrorBoundary(MembersQueryWithCacheInvalidation);
