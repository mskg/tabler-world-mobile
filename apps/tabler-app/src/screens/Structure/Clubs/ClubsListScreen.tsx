import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Card, IconButton, Searchbar, Surface, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName as ScreenName } from '../../../analytics/AuditScreenName';
import { RoleAccordionSection } from '../../../components/Club/RoleAccordionSection';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { CachedImage } from '../../../components/Image/CachedImage';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { Placeholder } from '../../../components/Placeholder/Placeholder';
import { RefreshTracker } from '../../../components/RefreshTracker';
import { TapOnNavigationParams } from '../../../components/ReloadNavigationOptions';
import { withCacheInvalidation } from '../../../helper/cache/withCacheInvalidation';
import { filterData } from '../../../helper/filterData';
import { I18N } from '../../../i18n/translation';
import { Features, isFeatureEnabled } from '../../../model/Features';
import { Clubs, ClubsVariables, Clubs_Clubs } from '../../../model/graphql/Clubs';
import { GetClubsQuery } from '../../../queries/Structure/GetClubsQuery';
import { homeScreen, showClub } from '../../../redux/actions/navigation';
import { CardPlaceholder } from '../CardPlaceholder';
import { CardTitle } from '../CardTitle';
import { StructureParams } from '../StructureParams';
import { styles } from '../Styles';
import { Routes } from './Routes';
import { Tab } from './Tab';
import { IAppState } from '../../../model/IAppState';

// const logger = new Logger(Categories.Screens.Structure);

type State = {
    search: string,
    filtered: Clubs_Clubs[],
};

type Props = {
    association?: string,
    theme: Theme,
    showClub: typeof showClub,

    loading: boolean,
    refresh: () => any,
    data?: Clubs | null,
} & NavigationInjectedProps<StructureParams & TapOnNavigationParams>;

class ClubsScreenBase extends AuditedScreen<Props, State> {
    flatList!: FlatList<Clubs_Clubs> | null;

    constructor(props) {
        super(props, ScreenName.Clubs);

        this.state = {
            search: '',
            filtered: this.filterResults(props.data),
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({
            tapOnTabNavigator: () => {
                requestAnimationFrame(
                    () => this.flatList?.scrollToOffset({
                        offset: 0, animated: true,
                    }),
                );

                if (this.props.data == null || this.props.data.Clubs == null || this.props.data.Clubs.length == 0) {
                    this.props.refresh();
                }
            },
        });

        this.audit.submit({
            [AuditPropertyNames.Association]: this.props.association,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.data !== this.props.data) {
            // logger.debug("Received", JSON.stringify(nextProps.data));

            this.setState({
                search: this.state.search,
                filtered: this.filterResults(this.props.data, this.state.search),
            });
        }
    }

    _showMap = () => requestAnimationFrame(() => this.props.navigation.navigate(Routes.Map));

    _renderItem = (params) => {
        const item: Clubs_Clubs = params.item;

        // remove RT
        const name = item.name.substring(item.name.indexOf(' ') + 1);
        const showClubFunc = () => this.props.showClub(item.id);

        return (
            <Card style={styles.card}>
                <CardTitle
                    title={name}
                    subtitle={`${item.area.name}, ${item.association.name}`}
                    avatar={item.clubnumber}
                />

                {item.logo && (
                    <TouchableWithoutFeedback onPress={showClubFunc}>
                        <View style={[styles.imageContainer, { backgroundColor: this.props.theme.colors.surface }]}>
                            <CachedImage
                                style={styles.image}
                                uri={item.logo}
                                cacheGroup="club"
                            />
                        </View>
                    </TouchableWithoutFeedback>
                )}

                {/*
                <Card.Content>
                    <Paragraph numberOfLines={3} style={{paddingTop: 16}}>
                    {`Round Table 129 Böblingen / Sindelfingen (RT 129) ist ein Tisch von Round Table Deutschland. RT 129 wurde am 24.10.1981 mit Unterstützung der Patentische RT 23 Stuttgart und RT 25 Winterthur (Schweiz) gechartert und somit offiziell in den Kreis von Round Table Deutschland aufgenommen.

Wir sind derzeit 20 "Tabler" und treffen uns zweimal im Monat zum Tischabend. Mitglieder anderer Tische sind natürlich jederzeit herzlich eingeladen!`}
                    </Paragraph>
                </Card.Content> */}

                <RoleAccordionSection group={I18N.Structure.board} groupDetails="board" club={item.id} />
                <RoleAccordionSection group={I18N.Structure.assist} groupDetails="boardassistants" club={item.id} />

                <Card.Actions style={styles.action}>
                    <Button color={this.props.theme.colors.accent} onPress={showClubFunc}>{I18N.Structure.details}</Button>
                </Card.Actions>
            </Card>
        );
    }

    _key = (item: Clubs_Clubs, _index: number) => {
        return item.id;
    }

    _makeSearchTexts = (c: Clubs_Clubs): string[] => {
        return [
            c.name,
            c.area.name,
            c.area.shortname,
        ].filter(Boolean);
    }

    _sortResults = (id: string) => (c: Clubs_Clubs): any => {
        // myClub goes on top
        return id === c.id
            ? 0
            : c
                ? c.clubnumber
                : -1;
    }

    filterResults(data: Clubs | undefined | null, text?: string) {
        return filterData(
            this._makeSearchTexts,
            data ? data.Clubs : null,
            text,
            undefined,
            data && data.Me
                ? this._sortResults(data.Me.club.id)
                : undefined,
        );
    }

    _search = (text: string) => {
        this.setState({
            search: text,
            filtered: this.filterResults(
                this.props.data,
                text,
            ),
        });
    }

    render() {
        const showMap = isFeatureEnabled(Features.ClubMap);

        return (
            <Placeholder
                ready={this.props.data != null && this.props.data.Clubs != null}
                previewComponent={<CardPlaceholder />}
            >
                <FlatList
                    ref={(r) => this.flatList = r}
                    contentContainerStyle={styles.container}
                    data={this.state.filtered}
                    ListHeaderComponent={(
                        <View style={{ flexDirection: 'row' }}>
                            <Searchbar
                                style={[styles.searchbar]}
                                selectionColor={this.props.theme.colors.accent}
                                placeholder={I18N.Search.search}
                                autoCorrect={false}

                                value={this.state.search}
                                onChangeText={this._search}
                            />

                            {showMap && (
                                <Surface style={styles.switchLayoutButton}>
                                    <IconButton
                                        icon={
                                            ({ size, color }) => (
                                                <Ionicons
                                                    name="md-map"
                                                    size={size}
                                                    color={color}
                                                />
                                            )
                                        }
                                        onPress={this._showMap}
                                    />
                                </Surface>
                            )}
                        </View>
                    )}
                    refreshing={this.props.loading}
                    onRefresh={this.props.refresh}
                    renderItem={this._renderItem}
                    keyExtractor={this._key}
                />
            </Placeholder>
        );
    }
}

const ConnectedClubScreen = connect(null, {
    showClub,
    homeScreen,
})(
    withTheme(
        withNavigation(ClubsScreenBase),
    ),
);

const ClubsScreenWithQuery = ({ fetchPolicy, screenProps, offline }) => (
    <Tab>
        <RefreshTracker>
            {({ isRefreshing, createRunRefresh }) => {
                return (
                    <Query<Clubs, ClubsVariables>
                        query={GetClubsQuery}
                        fetchPolicy={fetchPolicy}
                        variables={{
                            association: screenProps?.association,
                        }}
                    >
                        {({ loading, data, error, refetch }) => {
                            if (error) throw error;

                            if (!loading && (data == null || data.Clubs == null)) {
                                if (offline) {
                                    return <CannotLoadWhileOffline />;
                                }

                                setTimeout(createRunRefresh(refetch));
                            }

                            return (
                                <ConnectedClubScreen
                                    loading={loading || isRefreshing}
                                    data={data}
                                    refresh={createRunRefresh(refetch)}
                                    association={screenProps?.association}
                                />
                            );
                        }}
                    </Query>
                );
            }}
        </RefreshTracker>
    </Tab>
);

export const ClubsListScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'clubs',
            connect(
                (s: IAppState) => ({
                    offline: s.connection.offline,
                }),
            )(ClubsScreenWithQuery),
        ));
