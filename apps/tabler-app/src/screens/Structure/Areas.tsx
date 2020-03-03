import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Card, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { RoleAvatarGrid } from '../../components/Club/RoleAvatarGrid';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { RefreshTracker } from '../../components/RefreshTracker';
import { TapOnNavigationParams } from '../../components/ReloadNavigationOptions';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Areas, AreasVariables, Areas_Areas } from '../../model/graphql/Areas';
import { IAppState } from '../../model/IAppState';
import { GetAreasQuery } from '../../queries/Structure/GetAreasQuery';
import { CardPlaceholder } from './CardPlaceholder';
import { CardTitle } from './CardTitle';
import { ClubsSection } from './ClubsSection';
import { ScreenProps } from './StructureParams';
import { styles } from './Styles';
import { QueryFailedError } from '../../helper/QueryFailedError';
import { createApolloContext } from '../../helper/createApolloContext';

// const logger = new Logger(Categories.Screens.Structure);

type State = {};

type Props = {
    theme: Theme,
    refreshing: boolean,
    fetchPolicy?: any,
    offline: boolean;
};

/**
 * Normally the districts are numbered from 1...
 * If this is the case, we sort by that value.
 * @param shortname
 */
function getSortKey(shortname: string) {
    const nbrs = shortname.replace(/[^0-9]/ig, '');
    if (nbrs != null) {
        return parseInt(nbrs, 10);
    }

    return shortname;
}

class AreasScreenBase extends AuditedScreen<Props & ScreenProps & NavigationInjectedProps<TapOnNavigationParams>, State> {
    flatList!: FlatList<Areas_Areas> | null;

    constructor(props) {
        super(props, AuditScreenName.Areas);
    }

    componentDidMount() {
        this.props.navigation.setParams({
            tapOnTabNavigator: () => {
                requestAnimationFrame(
                    () => this.flatList?.scrollToOffset({
                        offset: 0, animated: true,
                    }),
                );

                // setTimeout(
                //     () => this.props.refresh(),
                //     100
                // );
            },
        });

        this.audit.submit({
            [AuditPropertyNames.Association]: this.props.screenProps?.association,
            [AuditPropertyNames.Area]: this.props.navigation.getParam('id'),
        });
    }

    _renderItem = (params) => {
        const item: Areas_Areas = params.item;

        return (
            <Card key={item.id} style={styles.card}>
                <CardTitle
                    title={item.name}
                    subtitle={item.association.name}
                    avatar={
                        // there can only be one :)
                        item.id === 'de_d9'
                            ? 'DIX'
                            : item.shortname
                    }
                />

                <RoleAvatarGrid roles={item.board} items={3} />
                <ClubsSection clubs={item.clubs} />

                <View style={styles.bottom} />
            </Card>
        );
    }

    _key = (item: Areas_Areas, _index: number) => {
        return item.id;
    }

    render() {
        return (
            <RefreshTracker>
                {({ isRefreshing, createRunRefresh }) => {
                    return (
                        <Query<Areas, AreasVariables>
                            query={GetAreasQuery}
                            fetchPolicy={this.props.fetchPolicy}
                            variables={{
                                association: this.props.screenProps?.association,
                            }}
                            context={createApolloContext('AreasScreenBase')}
                        >
                            {({ loading, error, data, refetch }) => {
                                if (error) throw new QueryFailedError(error);

                                if (!loading && (data == null || data.Areas == null)) {
                                    if (this.props.offline) {
                                        return <CannotLoadWhileOffline />;
                                    }

                                    setTimeout(createRunRefresh(refetch));
                                }

                                return (
                                    <Placeholder
                                        ready={data != null && data.Areas != null}
                                        previewComponent={<CardPlaceholder />}
                                    >
                                        <FlatList
                                            ref={(r) => this.flatList = r}
                                            contentContainerStyle={styles.container}
                                            data={
                                                _(data != null ? data.Areas : [])
                                                    // my own area goes on top
                                                    .orderBy((a) => (
                                                        data != null &&
                                                        (this.props.navigation.getParam('id') || data.Me.area.id) === a.id
                                                    ) ? -1 : getSortKey(a.shortname))
                                                    .toArray()
                                                    .value()
                                            }
                                            refreshing={isRefreshing || loading}
                                            onRefresh={createRunRefresh(refetch)}
                                            renderItem={this._renderItem}
                                            keyExtractor={this._key}
                                        />
                                    </Placeholder>
                                );
                            }}
                        </Query>

                    );
                }}
            </RefreshTracker>
        );
    }
}

// tslint:disable-next-line: export-name
export const AreasScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'areas',
            withTheme(
                connect(
                    (s: IAppState) => ({
                        offline: s.connection.offline,
                    }),
                )(AreasScreenBase))));
