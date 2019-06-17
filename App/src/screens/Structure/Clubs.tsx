import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Card, Searchbar, Theme, withTheme } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { RoleAccordionSection } from '../../components/Club/RoleAccordionSection';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { CachedImage } from '../../components/Image/CachedImage';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../helper/Logger";
import { normalizeForSearch } from '../../helper/normalizeForSearch';
import { I18N } from '../../i18n/translation';
import { homeScreen, showClub } from '../../redux/actions/navigation';
import { CardTitle } from './CardTitle';
import { GetClubsQuery, GetClubsQueryType, GetClubsQueryType_Club } from './Queries';
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Structure);

type State = {
    search: string,
    debouncedSearch: string,
    filtered: GetClubsQueryType_Club[],
};

type Props = {
    theme: Theme,
    navigation: any,
    showClub: typeof showClub,

    loading: boolean,
    refresh: () => any,
    data?: GetClubsQueryType,
};

class ClubsScreenBase extends React.Component<Props, State> {
    constructor(props) {
        super(props);

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

    _renderItem = (params) => {
        const item: GetClubsQueryType_Club = params.item;

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
                                theme={this.props.theme}
                                style={styles.image}
                                uri={item.logo}
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

                {/* <View style={styles.bottom} /> */}

                <Card.Actions style={styles.action}>
                    <Button color={this.props.theme.colors.accent} onPress={showClub}>{I18N.Structure.details}</Button>
                </Card.Actions>
            </Card>);
    }

    _key = (item: GetClubsQueryType_Club, index: number) => {
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

    makeSearchTexts(c: GetClubsQueryType_Club): string[] {
        return [
            c.name,
            c.area.name,
            "D" + c.area.area,
        ].filter(Boolean);
    }

    filterData(data, text?: string): GetClubsQueryType_Club[] {
        if (data == null) { return []; }

        //@ts-ignore
        return _(data.Clubs)
            .map((item: GetClubsQueryType_Club) => {
                var match = _.find(
                    this.makeSearchTexts(item),
                    this._normalizedSearch(text || ""));

                return match ? {
                    ...item,
                    match,
                } : null;
            })
            .filter(r => r != null)
            .orderBy((a: GetClubsQueryType_Club) =>
                (data != null && (text === "" || text == null) && data.Me.club.club == a.club)
                    ? 0
                    : a.club)
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
            <View style={{ width: '100%', height: '100%' }}>
                <FlatList
                    contentContainerStyle={styles.container}
                    data={this.state.filtered}
                    ListHeaderComponent={
                        <Searchbar
                            style={[styles.searchbar]}
                            selectionColor={this.props.theme.colors.accent}
                            placeholder={I18N.Search.search}
                            autoCorrect={false}

                            value={this.state.search}
                            onChangeText={this._search}
                        />
                    }
                    refreshing={this.props.loading}
                    onRefresh={this.props.refresh}
                    renderItem={this._renderItem}
                    keyExtractor={this._key}
                />
            </View>
        );
    }
}

const ConnectedClubScreen = connect(null, {
    showClub,
    homeScreen,
})(withNavigation(withTheme(ClubsScreenBase)));

export const ClubsScreenWithQuery = ({ fetchPolicy }) => (
    <Query<GetClubsQueryType> query={GetClubsQuery} fetchPolicy={fetchPolicy}>
        {({ loading, data, error, refetch }) => {
            if (error) throw error;

            return (<ConnectedClubScreen loading={loading} data={data} refresh={refetch} />);
        }}
    </Query>
);

export const ClubsScreen = withWhoopsErrorBoundary(withCacheInvalidation("clubs", ClubsScreenWithQuery));