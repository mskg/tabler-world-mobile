import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Card, Paragraph, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
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
import { I18N } from '../../i18n/translation';
import { Association, Association_Association } from '../../model/graphql/Association';
import { RoleNames } from '../../model/IRole';
import { GetAssociationQuery } from '../../queries/Structure/GetAssociationQuery';
import { CardPlaceholder } from './CardPlaceholder';
import { ScreenProps, StructureParams } from './StructureParams';
import { styles } from './Styles';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { IAppState } from '../../model/IAppState';
import { connect } from 'react-redux';

// const logger = new Logger(Categories.Screens.Structure);

type State = {};

type Props = {
    offline: boolean,
    theme: Theme,
    navigation: any,
    fetchPolicy: any,
};

class AssociationsScreenBase extends AuditedScreen<Props & ScreenProps & NavigationInjectedProps<StructureParams & TapOnNavigationParams>, State> {
    flatList!: FlatList<Association_Association> | null;

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

    _renderItem = ({ item, index }: { item: Association_Association, index: number }) => {
        return (
            <Card key={item.id} style={styles.card}>

                {item.logo && (
                    <View style={[styles.imageContainer, { backgroundColor: this.props.theme.colors.surface }]}>
                        <CachedImage
                            style={styles.image}
                            cacheGroup="club"
                            uri={item.logo}
                        />
                    </View>
                )}

                <Card.Title
                    title={item.name}
                />

                {item.id === 'de' && (
                    <Card.Content>
                        <Paragraph>
                            {`LEBENSFREUNDE

Tabler sind Freunde des Lebens. Sie leben gern und sind sich bewusst, dass es vielen nicht so gut geht. Sie möchten ihre Lebensfreude teilen mit jenen, die nicht so viel Glück hatten oder haben.

Tabler sind Freunde fürs Leben. Sie haben Freunde auf der ganzen Welt, völlig unabhängig davon, ob sie sich vorher schon einmal begegnet sind, oder noch nicht.

#weilwirdasmachen
#lebensfreunde
#tableraufreisen`}
                        </Paragraph>
                    </Card.Content>
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

                {item.boardassistants.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.assist} expanded={false}>
                        <RoleAvatarGrid roles={item.boardassistants} items={2} />
                    </Accordion>
                )}

                <View style={styles.bottom} />
            </Card>
        );
    }

    _key = (item: Association_Association, _index: number) => {
        return item.id;
    }

    render() {
        return (
            <RefreshTracker>
                {({ isRefreshing, createRunRefresh }) => {
                    return (
                        <Query<Association>
                            query={GetAssociationQuery}
                            fetchPolicy={this.props.fetchPolicy}
                            variables={{
                                id: this.props.screenProps?.association,
                            }}
                        >
                            {({ loading, error, data, refetch }) => {
                                if (error) throw error;

                                if (!loading && (data == null || data.Association == null)) {
                                    if (this.props.offline) {
                                        return <CannotLoadWhileOffline />;
                                    }

                                    setTimeout(createRunRefresh(refetch));
                                }

                                return (
                                    <Placeholder
                                        ready={data != null && data.Association != null}
                                        previewComponent={<CardPlaceholder />}
                                    >
                                        <FlatList
                                            ref={(r) => this.flatList = r}
                                            contentContainerStyle={styles.container}
                                            data={data && data.Association ? [data.Association] : []}

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
export const AssociationsScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'associations',
            withTheme(
                connect(
                    (s: IAppState) => ({
                        offline: s.connection.offline,
                    }),
                )(AssociationsScreenBase),
            ),
        ),
    );
