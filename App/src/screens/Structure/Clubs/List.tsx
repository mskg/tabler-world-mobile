import { Ionicons } from '@expo/vector-icons';
import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Card, IconButton, Searchbar, Surface, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName as ScreenName } from '../../../analytics/AuditScreenName';
import { RoleAccordionSection } from '../../../components/Club/RoleAccordionSection';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { CachedImage } from '../../../components/Image/CachedImage';
import { Placeholder } from '../../../components/Placeholder/Placeholder';
import { withCacheInvalidation } from '../../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../../helper/Logger";
import { normalizeForSearch } from '../../../helper/normalizeForSearch';
import { I18N } from '../../../i18n/translation';
import { Clubs, Clubs_Clubs } from '../../../model/graphql/Clubs';
import { GetClubsQuery } from '../../../queries/GetClubsQuery';
import { homeScreen, showClub } from '../../../redux/actions/navigation';
import { CardPlaceholder } from '../CardPlaceholder';
import { CardTitle } from '../CardTitle';
import { styles } from '../Styles';
import { Routes } from './Routes';

const logger = new Logger(Categories.Screens.Structure);

type State = {
    search: string,
    debouncedSearch: string,
    filtered: Clubs_Clubs[],
};

type Props = {
    theme: Theme,
    showClub: typeof showClub,

    loading: boolean,
    refresh: () => any,
    data?: Clubs | null,
} & NavigationInjectedProps;

class ClubsScreenBase extends AuditedScreen<Props, State> {
    constructor(props) {
        super(props, ScreenName.Clubs);

        this.state = {
            search: "",
            debouncedSearch: "",
            filtered: this.filterData(props.data),
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.data !== this.props.data) {
            // logger.debug("Received", JSON.stringify(nextProps.data));

            this.setState({
                search: this.state.search,
                filtered: this.filterData(nextProps.data, this.state.search)
            });
        }
    }

    _showMap = () => requestAnimationFrame(() => this.props.navigation.navigate(Routes.Map));

    _renderItem = (params) => {
        const item: Clubs_Clubs = params.item;

        // remove RT
        const name = item.name.substring(item.name.indexOf(' ') + 1);
        const showClub = () => this.props.showClub(item.id);

        return (
            <Card style={styles.card}>
                <CardTitle
                    title={name}
                    subtitle={item.area.name + ", " + item.association.name}
                    avatar={item.club}
                />

                {item.logo &&
                    <TouchableWithoutFeedback onPress={showClub}>
                        <View style={[styles.imageContainer, { backgroundColor: this.props.theme.colors.surface }]}>
                            <CachedImage
                                style={styles.image}
                                uri={item.logo}
                                cacheGroup="club"
                            />
                        </View>
                    </TouchableWithoutFeedback>
                }

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
                    <Button color={this.props.theme.colors.accent} onPress={showClub}>{I18N.Structure.details}</Button>
                </Card.Actions>
            </Card>);
    }

    _key = (item: Clubs_Clubs, index: number) => {
        return item.id;
    }

    _normalizedSearch = (search: string) => (target: string) => {
        const segments = normalizeForSearch(search).split(' ');
        const changedTarget = normalizeForSearch(target);

        let found = false;
        for (const search of segments) {
            if (changedTarget.indexOf(search) < 0) {
                return false;
            }

            found = true;
        }

        return found;
    }

    makeSearchTexts(c: Clubs_Clubs): string[] {
        return [
            c.name,
            c.area.name,
            "D" + c.area.area,
        ].filter(Boolean);
    }

    filterData(data?: Clubs | null, text?: string): Clubs_Clubs[] {
        if (data == null) { return []; }

        //@ts-ignore
        return _(data.Clubs)
            .map((item: Clubs_Clubs) => {
                var match = _.find(
                    this.makeSearchTexts(item),
                    this._normalizedSearch(text || ""));

                return match ? {
                    ...item,
                    match,
                } : null;
            })
            .filter(r => r != null)
            .orderBy((a) =>
                (
                    a != null && data != null && (text === "" || text == null) && data.Me.club.club == a.club)
                    ? 0
                    : a ? a.club : -1
            )
            .toArray()
            .value();
    }

    _search = (text) => {
        this.setState({
            search: text,
            filtered: this.filterData(this.props.data, text)
        });
    }

    render() {
        return (
            <View style={{ width: '100%', height: '100%', backgroundColor: this.props.theme.colors.background }}>
                <Placeholder
                    ready={this.props.data != null && this.props.data.Clubs != null}
                    previewComponent={<CardPlaceholder />}
                >
                    <FlatList
                        contentContainerStyle={styles.container}
                        data={this.state.filtered}
                        ListHeaderComponent={
                            <View style={{ flexDirection: "row" }}>
                                <Searchbar
                                    style={[styles.searchbar]}
                                    selectionColor={this.props.theme.colors.accent}
                                    placeholder={I18N.Search.search}
                                    autoCorrect={false}

                                    value={this.state.search}
                                    onChangeText={this._search}
                                />

                                <Surface style={styles.switchLayoutButton}>
                                    <IconButton
                                        icon={({ size, color }) =>
                                            <Ionicons
                                                name="md-map"
                                                size={size}
                                                color={color}
                                            />}
                                        onPress={this._showMap}
                                    />
                                </Surface>
                            </View>
                        }
                        refreshing={this.props.loading}
                        onRefresh={this.props.refresh}
                        renderItem={this._renderItem}
                        keyExtractor={this._key}
                    />
                </Placeholder>
            </View>
        );
    }
}

const ConnectedClubScreen = connect(null, {
    showClub,
    homeScreen,
})(withTheme(withNavigation(ClubsScreenBase)));

const ClubsScreenWithQuery = ({ fetchPolicy }) => (
    <Query<Clubs> query={GetClubsQuery} fetchPolicy={fetchPolicy}>
        {({ loading, data, error, refetch }) => {
            if (error) throw error;

            return (<ConnectedClubScreen loading={loading} data={data} refresh={refetch} />);
        }}
    </Query>
);

export const ClubsScreen = withWhoopsErrorBoundary(
    withCacheInvalidation("clubs", ClubsScreenWithQuery));
