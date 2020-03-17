import { debounce, remove, sortBy } from 'lodash';
import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { Appbar, Chip, Divider, Searchbar, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { MetricNames } from '../../analytics/MetricNames';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { FilterTag, FilterTagType } from '../../components/FilterSection';
import { StandardHeader } from '../../components/Header';
import { MemberListItem } from '../../components/Member/MemberListItem';
import { Screen } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { Me } from '../../model/graphql/Me';
import { IAppState } from '../../model/IAppState';
import { GetMeQuery } from '../../queries/Member/GetMeQuery';
import { addTablerSearch } from '../../redux/actions/history';
import { showProfile } from '../../redux/actions/navigation';
import { HeaderStyles } from '../../theme/dimensions';
import { FilterDialog } from './FilterDialog';
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
        query: '',
        debouncedQuery: '',

        searching: false,
        update: false,
        showFilter: false,

        filterTags: [],
    };

    constructor(props) {
        super(props, AuditScreenName.MemberSearch);
    }

    componentDidMount() {
        super.componentDidMount();
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

        this.state.filterTags.push(... this.getDefaultAssocFilter());
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getDefaultAssocFilter(): FilterTag[] {
        try {
            const client = cachedAolloClient();
            const me = client.readQuery<Me>({
                query: GetMeQuery,
            });

            if (me?.Me.association.name != null) {
                return [{
                    type: 'association',
                    value: me?.Me.association.name,
                    id: me?.Me.association.id,
                }];
            }
            // tslint:disable-next-line: no-empty
        } catch (e) {
            logger.error('search-screen-me', e);
        }

        return [];
    }

    _searchBar!: Searchbar | null;

    _adjustSearch = debounce(
        (text, filters: FilterTag[]) => {
            if (!this.mounted) {
                // due to async nature, we can already be unmounted
                return;
            }

            if (text !== '' && text != null) {
                this.audit.increment(MetricNames.Count);
            }

            this.setState({
                searching: true,
                debouncedQuery: text,
                update: !this.state.update,
                filterTags: filters || [],
            });
        },
        250,
    );

    _clearSearch = () => {
        this.setState({
            query: '',
            debouncedQuery: '',
            searching: false,
            filterTags: this.getDefaultAssocFilter(),
            showFilter: false,
        });
    }

    searchFilterFunction = (text) => {
        if (text == null || text === '') {
            this._adjustSearch.cancel();
            this._clearSearch();
        } else {
            this.setState({ query: text });
            this._adjustSearch(text, this.state.filterTags);
        }
    }

    _itemSelected = (item) => {
        this.props.addTablerSearch(this.state.query);
        this.props.showProfile(item.id);
    }

    // tslint:disable-next-line: function-name
    _renderMatch(member, onPress) {
        return (
            <MemberListItem
                theme={this.props.theme}
                onPress={onPress}
                member={member}
            />
        );

        // return (<HighLightMemberListItem
        //     theme={this.props.theme}
        //     onPress={onPress}
        //     member={tabler}
        //     text={(tabler as HighLightedTabler).match}
        //     search={this.state.debouncedQuery.split(' ')} />
        // );
    }

    _onToggleAsssociation = (type: FilterTagType, value: string, id?: string) => {
        const tags = this._onToggleTag(type, value, id, false);

        const association = tags.filter((t) => t.type === 'association');

        if (association.length > 0 || association.length === 0) {
            remove(tags, (f: FilterTag) => f.type === 'area' || f.type === 'table');
        }

        this._adjustSearch(this.state.query, tags);
    }

    _onToggleTag = (type: FilterTagType, value: string, id?: string, refresh = true): FilterTag[] => {
        logger.debug('toggle', type, value);

        // @ts-ignore range is supported
        this.audit.increment(`Toggle ${type}`);

        const tags = [...this.state.filterTags];

        if (remove(tags, (f: FilterTag) => f.type === type && f.value === value).length === 0) {
            tags.push({
                type,
                value,
                id,
            });
        }

        if (refresh) {
            this._adjustSearch(this.state.query, tags);
        }

        return tags;
    }

    _showFilterDialog = () => {
        this.audit.increment(MetricNames.ShowFilterDialog);

        if (this._searchBar) { this._searchBar.blur(); }
        this.setState({ showFilter: !this.state.showFilter });
    }

    render() {
        return (
            <Screen>
                {this.state.searching && this.state.filterTags.length > 0 && (
                    <TouchableWithoutFeedback onPress={this._showFilterDialog}>
                        <>
                            <View style={[styles.chips, { backgroundColor: this.props.theme.colors.primary }]}>
                                {
                                    sortBy(this.state.filterTags, ['type', 'value']).map((f: FilterTag) => (
                                        <Chip
                                            style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                                            key={`${f.type}:${f.value}`}
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
                )}

                {!this.state.searching && (
                    <View style={{ flexGrow: 1, }}>
                        <LRU />
                        <SearchHistory
                            applyFilter={this.searchFilterFunction}
                            contentContainerStyle={{ paddingBottom: 16 }}
                        />
                    </View>
                )}

                {this.state.searching && this.props.offline && (
                    <OfflineSearchQuery
                        query={this.state.debouncedQuery}
                        filterTags={this.state.filterTags}
                        itemSelected={this._itemSelected}
                    />
                )}

                {this.state.searching && !this.props.offline && (
                    <OnlineSearchQuery
                        query={this.state.debouncedQuery}
                        filterTags={this.state.filterTags}
                        itemSelected={this._itemSelected}
                    />
                )}

                <FilterDialog
                    filterTags={this.state.filterTags}
                    toggleAssociation={this._onToggleAsssociation}
                    toggleTag={this._onToggleTag}

                    visible={this.state.showFilter}
                    hide={() => this.setState({ showFilter: false })}
                    clear={this._clearSearch}
                />

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
                                    placeholder={I18N.Screen_Search.search}
                                    autoCorrect={false}

                                    value={this.state.query}
                                    onChangeText={(text) => this.searchFilterFunction(text)}
                                />
                            </View>
                            <Appbar.Action
                                color={this.props.theme.dark ? 'white' : 'black'}
                                icon={'filter-list'}
                                onPress={this._showFilterDialog}
                            />
                        </View>
                    )}
                />
            </Screen>
        );
    }
}

// tslint:disable-next-line: export-name
export const SearchScreen = connect(
    (state: IAppState) => ({
        sortBy: state.settings.sortByLastName ? 'lastname' : 'firstname',
        offline: state.connection.offline,
    }),
    {
        addTablerSearch,
        showProfile,
    },
)(
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'utility',
            withTheme(SearchScreenBase),
        ),
    ),
);
