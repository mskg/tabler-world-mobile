import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Card, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { Accordion } from '../../components/Accordion';
import { RoleAvatarGrid } from '../../components/Club/RoleAvatarGrid';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { CachedImage } from '../../components/Image/CachedImage';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { RefreshTracker } from '../../components/RefreshTracker';
import { TapOnNavigationParams } from '../../components/ReloadNavigationOptions';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { createApolloContext } from '../../helper/createApolloContext';
import { QueryFailedError } from '../../helper/QueryFailedError';
import { I18N } from '../../i18n/translation';
import { Family, Family_Association_family } from '../../model/graphql/Family';
import { IAppState } from '../../model/IAppState';
import { RoleNames } from '../../model/IRole';
import { GetFamilyQuery } from '../../queries/Structure/GetFamilyQuery';
import { CardPlaceholder } from './CardPlaceholder';
import { ScreenProps, StructureParams } from './StructureParams';
import { styles } from './Styles';

// const logger = new Logger(Categories.Screens.Structure);

type State = {};

type Props = {
    offline: boolean,
    theme: Theme,
    navigation: any,
    fetchPolicy: any,
};

class FamilyScreenBase extends AuditedScreen<Props & ScreenProps & NavigationInjectedProps<StructureParams & TapOnNavigationParams>, State> {
    flatList!: FlatList<Family_Association_family> | null;

    constructor(props) {
        super(props, AuditScreenName.Associations);
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
        });
    }

    _renderItem = ({ item, index }: { item: Family_Association_family, index: number }) => {
        return (
            <Card key={item.id} style={styles.card}>

                <Card.Title
                    title={item.name}
                />

                {item.logo && (
                    <View style={[styles.imageContainer, { backgroundColor: this.props.theme.colors.surface }]}>
                        <CachedImage
                            style={styles.image}
                            cacheGroup="association"
                            uri={item.logo}
                        />
                    </View>
                )}

                {item.board.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.president} expanded={index === 0}>
                        <RoleAvatarGrid roles={item.board.filter((r) => r.role === RoleNames.President)} items={1} />
                    </Accordion>
                )}

                {item.board.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.board} expanded={false}>
                        <RoleAvatarGrid roles={item.board.filter((r) => r.role !== RoleNames.President)} items={2} />
                    </Accordion>
                )}

                {item.regionalboard.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.regionalboard} expanded={false}>
                        <RoleAvatarGrid roles={item.regionalboard} items={2} />
                    </Accordion>
                )}

                {item.boardassistants.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.assist} expanded={false}>
                        <RoleAvatarGrid roles={item.boardassistants} items={2} />
                    </Accordion>
                )}

                <View style={styles.bottom} />
            </Card>
        );
    }

    _key = (item: Family_Association_family, _index: number) => {
        return item.id;
    }

    render() {
        return (
            <RefreshTracker>
                {({ isRefreshing, createRunRefresh }) => {
                    return (
                        <Query<Family>
                            query={GetFamilyQuery}
                            fetchPolicy={this.props.fetchPolicy}
                            variables={{
                                id: this.props.screenProps?.association,
                            }}
                            context={createApolloContext('FamiliesScreenBase')}
                        >
                            {({ loading, error, data, refetch }) => {
                                if (error) throw new QueryFailedError(error);

                                if (!loading && (data == null || data.Association == null)) {
                                    if (this.props.offline) {
                                        return <CannotLoadWhileOffline />;
                                    }

                                    setTimeout(createRunRefresh(refetch));
                                }

                                return (
                                    <Placeholder
                                        ready={data != null && data.Association?.family != null}
                                        previewComponent={<CardPlaceholder />}
                                    >
                                        <FlatList
                                            ref={(r) => this.flatList = r}
                                            contentContainerStyle={styles.container}
                                            data={data && data.Association?.family ? [data.Association?.family] : []}

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
export const FamiliesScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'families',
            withTheme(
                connect(
                    (s: IAppState) => ({
                        offline: s.connection.offline,
                    }),
                )(FamilyScreenBase),
            ),
        ),
    );
