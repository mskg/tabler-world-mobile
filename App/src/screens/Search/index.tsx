import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Modal, ScrollView, TouchableWithoutFeedback, View } from "react-native";
import { Appbar, Chip, Divider, List, Searchbar, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { MetricNames } from '../../analytics/MetricNames';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { FilterSection, FilterTag, FilterTagType } from "../../components/FilterSection";
import { StandardHeader } from '../../components/Header';
import ListSubheader from "../../components/ListSubheader";
import { InlineLoading } from '../../components/Loading';
import { MemberListItem } from '../../components/Member/MemberListItem';
import { Screen } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { Filters, Filters_Clubs } from '../../model/graphql/Filters';
import { IAppState } from '../../model/IAppState';
import { GetFiltersQuery } from "../../queries/GetFiltersQuery";
import { addTablerSearch } from '../../redux/actions/history';
import { showProfile } from '../../redux/actions/navigation';
import { HeaderStyles } from '../../theme/dimensions';
import { logger } from './logger';
import { LRU } from './LRU';
import { OfflineSearchQuery } from './OfflineSearch';
import { OnlineSearchQuery } from './OnlineSearch';
import { SearchHistory } from './SearchHistory';
import { styles } from './styles';

type State = {
    searching: boolean,
    query: string,
    debouncedQuery: string,
    filterTags: FilterTag[],

    update: boolean,
    showFilter: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    sortBy: string,
    fetchPolicy: any,
    offline: boolean,
};

type DispatchPros = {
    addTablerSearch: typeof addTablerSearch;
    showProfile: typeof showProfile;
};

type Props = OwnProps & StateProps & DispatchPros;

class SearchScreenBase extends AuditedScreen<Props, State> {
    mounted = true;

    state: State = {
        query: "",
        debouncedQuery: "",

        searching: false,
        update: false,
        showFilter: false,

        filterTags: [],
    };

    constructor(props) {
        super(props, AuditScreenName.MemberSearch);
    }

    componentDidMount() {
        this.mounted = true;

        // if called without blur, settimeout, keyboard will never get dismissed?
        if (this._searchBar != null) {
            setTimeout(() => {
                if (this._searchBar != null) {
                    this._searchBar.blur();
                    this._searchBar.focus();
                }
            });
        }

        logger.debug("Logged");
        this.audit.submit();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    _searchBar!: Searchbar | null;

    _adjustSearch = _.debounce((text, filters: FilterTag[]) => {
        if (!this.mounted) {
            // due to async nature, we can already be unmounted
            return;
        }

        if (text != "" && text != null) {
            this.audit.increment(MetricNames.Count);
        }

        this.setState({
            searching: true,
            debouncedQuery: text,
            update: !this.state.update,
            filterTags: filters || [],
        });
    }, 250);

    _clearSearch = () => {
        this.setState({
            query: "",
            debouncedQuery: "",
            searching: false,
            filterTags: [],
            showFilter: false,
        });
    }

    searchFilterFunction = (text) => {
        if (text == null || text == "") {
            this._adjustSearch.cancel();
            this._clearSearch();
        } else {
            this.setState({ query: text });
            this._adjustSearch(text, this.state.filterTags);
        }
    };

    _itemSelected = (item) => {
        this.props.addTablerSearch(this.state.query);
        this.props.showProfile(item.id);
    }

    _renderMatch(member, onPress) {
        return <MemberListItem
            theme={this.props.theme}
            onPress={onPress}
            member={member}
        />

        // return (<HighLightMemberListItem
        //     theme={this.props.theme}
        //     onPress={onPress}
        //     member={tabler}
        //     text={(tabler as HighLightedTabler).match}
        //     search={this.state.debouncedQuery.split(' ')} />
        // );
    }

    _onToggleTag = (type: FilterTagType, value: string) => {
        logger.debug("toggle", type, value);

        //@ts-ignore
        this.audit.increment(`Toggle ${type}`);

        const tags = [...this.state.filterTags];

        if (_.remove(tags, (f: FilterTag) => f.type == type && f.value == value).length === 0) {
            //@ts-ignore
            tags.push({
                type,
                value,
            })
        }

        this._adjustSearch(this.state.query, tags);
    }

    _showFilterDialog = () => {
        this.audit.increment(MetricNames.ShowFilterDialog);

        if (this._searchBar) { this._searchBar.blur(); }
        this.setState({ showFilter: !this.state.showFilter });
    }

    render() {
        return (
            <Screen>
                {this.state.filterTags.length > 0 &&
                    <TouchableWithoutFeedback onPress={this._showFilterDialog}>
                        <>
                            <View style={[styles.chips, { backgroundColor: this.props.theme.colors.primary }]}>
                                {
                                    _.sortBy(this.state.filterTags, ["type", "value"]).map((f: FilterTag) => (
                                        <Chip
                                            style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                                            key={f.type + ":" + f.value}
                                            selected={true}
                                            onPress={() => this._onToggleTag(f.type, f.value)}
                                        >
                                            {f.value}
                                        </Chip>
                                    ))
                                }
                            </View>
                            <Divider />
                        </>
                    </TouchableWithoutFeedback>
                }

                {!this.state.searching &&
                    <>
                        <LRU />
                        <SearchHistory
                            applyFilter={this.searchFilterFunction}
                        />
                    </>
                }

                {this.state.searching && this.props.offline &&
                    <OfflineSearchQuery
                        query={this.state.debouncedQuery}
                        filterTags={this.state.filterTags}
                        itemSelected={this._itemSelected}
                    />
                }

                {this.state.searching && !this.props.offline &&
                    <OnlineSearchQuery
                        query={this.state.debouncedQuery}
                        filterTags={this.state.filterTags}
                        itemSelected={this._itemSelected}
                    />
                }

                <Modal
                    visible={this.state.showFilter}
                    transparent={true}
                    onRequestClose={() => this.setState({ showFilter: false })}
                    animationType="fade"
                >
                    <TouchableWithoutFeedback onPress={() => this.setState({ showFilter: false })}>
                        <View style={{
                            ...styles.overlay,
                            backgroundColor: this.props.theme.colors.backdrop,
                        }} />
                    </TouchableWithoutFeedback>

                    <View style={{
                        ...styles.popup,
                        backgroundColor: this.props.theme.colors.background,
                        borderColor: this.props.theme.colors.backdrop,
                    }}>
                        <List.Section>
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginRight: 4,
                            }}>
                                <ListSubheader>{I18N.Search.filter}</ListSubheader>
                                <Appbar.Action color={this.props.theme.colors.accent} icon={"clear"} onPress={this._clearSearch} />
                            </View>
                            <ScrollView style={{ minHeight: "100%" }}>
                                <Divider />
                                <Query<Filters> query={GetFiltersQuery} fetchPolicy={this.props.fetchPolicy}>
                                    {({ loading, data, error, refetch }) => {
                                        // ok for now
                                        if (error) return null;

                                        if (data == null
                                            || data.Roles == null
                                            || data.Areas == null
                                            || data.Clubs == null) {
                                            return (<View style={{ marginHorizontal: 16 }}><InlineLoading /></View>);
                                        }

                                        return (
                                            <>
                                                <FilterSection
                                                    title={I18N.Search.roles(data.Roles.length)}
                                                    type="role"
                                                    filter={this.state.filterTags}
                                                    data={data.Roles}
                                                    onToggle={this._onToggleTag}
                                                    theme={this.props.theme}
                                                />

                                                <Divider />
                                                <FilterSection
                                                    title={I18N.Search.areas(data.Areas.length)}
                                                    type="area"
                                                    filter={this.state.filterTags}
                                                    data={data.Areas.map(a => a.name)}
                                                    onToggle={this._onToggleTag}
                                                    theme={this.props.theme}
                                                />

                                                <Divider />
                                                <FilterSection
                                                    title={I18N.Search.tables(data.Clubs.length)}
                                                    type="table"
                                                    filter={this.state.filterTags}
                                                    data={_(data.Clubs).orderBy((a: Filters_Clubs) => a.name.substring(a.name.indexOf(' ')))
                                                        .map(a => a.name)
                                                        .toArray()
                                                        .value()
                                                    }
                                                    onToggle={this._onToggleTag}
                                                    theme={this.props.theme}
                                                />

                                                <Divider />
                                                <FilterSection
                                                    title={I18N.Search.sectors(Object.keys(I18N.Search.sectorNames).length)}
                                                    type="sector"
                                                    filter={this.state.filterTags}
                                                    data={_(I18N.Search.sectorNames).values().sort().toArray().value()}
                                                    onToggle={this._onToggleTag}
                                                    theme={this.props.theme}
                                                />
                                            </>
                                        );
                                    }}
                                </Query>

                                <Divider />
                            </ScrollView>
                        </List.Section>
                    </View>

                    <View style={{
                        ...styles.triangle,
                        borderBottomColor: this.props.theme.colors.background,
                    }} />
                </Modal>

                <StandardHeader
                    style={[HeaderStyles.topBar, { backgroundColor: this.props.theme.colors.primary }]}
                    showBack={true}
                    content={(
                        <View style={[styles.top]}>
                            <View style={styles.search}>
                                <Searchbar
                                    ref={(fl) => this._searchBar = fl}
                                    style={[styles.searchbar]}
                                    selectionColor={this.props.theme.colors.accent}
                                    placeholder={I18N.Search.search}
                                    autoCorrect={false}

                                    value={this.state.query}
                                    onChangeText={text => this.searchFilterFunction(text)}
                                />
                            </View>
                            <Appbar.Action
                                color={this.props.theme.dark ? "white" : "black"}
                                icon={"filter-list"}
                                onPress={this._showFilterDialog}
                            />
                        </View>
                    )}
                />
            </Screen>
        );
    }
}

export const SearchScreen = connect(
    (state: IAppState) => ({
        sortBy: state.settings.sortByLastName ? "lastname" : "firstname",
        offline: state.connection.offline,
    }), {
        addTablerSearch,
        showProfile,
    })(
        withWhoopsErrorBoundary(
            withCacheInvalidation("utility",
                withTheme(SearchScreenBase)
            )
        )
    );
