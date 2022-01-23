import { debounce, remove, sortBy } from 'lodash';
import React from 'react';
import { ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { Appbar, Chip, Divider, Searchbar, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { MetricNames } from '../../analytics/MetricNames';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { FilterTag, FilterTagType, SortMap } from '../../components/FilterSection';
import { StandardHeader } from '../../components/Header';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Screen } from '../../components/Screen';
import { I18N } from '../../i18n/translation';
import { Me } from '../../model/graphql/Me';
import { SearchDirectory_SearchDirectory_nodes } from '../../model/graphql/SearchDirectory';
import { IAppState } from '../../model/IAppState';
import { GetMeQuery } from '../../queries/Member/GetMeQuery';
import { addStructureSearch } from '../../redux/actions/history';
import { showArea, showAssociation, showClub } from '../../redux/actions/navigation';
import { AppTheme } from '../../theme/AppTheme';
import { HeaderStyles } from '../../theme/dimensions';
import { AssociationsList } from './AssociationsList';
import { FilterDialog } from './FilterDialog';
import { logger } from './logger';
import { OnlineSearchQuery } from './OnlineSearch';
import { SearchHistory } from './SearchHistory';
import { styles } from './styles';

type State = {
    searching: boolean,
    query: string,
    debouncedQuery: string,
    update: boolean,

    filterTags: FilterTag[],
    showFilter: boolean,
};

type OwnProps = {
    theme: AppTheme,
};

type StateProps = {
    offline: boolean,
};

type DispatchPros = {
    showClub: typeof showClub;
    showArea: typeof showArea;
    showAssociation: typeof showAssociation;
    addStructureSearch: typeof addStructureSearch;
};

type NavigationParams = {
    expandAssociations?: boolean,
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<NavigationParams>;

class SearchStructureScreenBase extends AuditedScreen<Props, State> {
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
        super(props, AuditScreenName.StructureSearch);
    }

    componentDidMount() {
        super.componentDidMount();
        this.mounted = true;

        // if called without blur, settimeout, keyboard will never get dismissed?
        if (this._searchBar != null && !this.props.navigation.getParam('expandAssociations')) {
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
        const result = [];

        try {
            const client = cachedAolloClient();
            const me = client.readQuery<Me>({
                query: GetMeQuery,
            });

            if (me?.Me.family.name != null) {
                result.push({
                    type: 'family',
                    value: me?.Me.family.name,
                    id: me?.Me.family.id,
                });
            }
            // tslint:disable-next-line: no-empty
        } catch (e) {
            logger.error('structure-search-me', e);
        }

        return result;
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

            logger.debug('Searching for', text);
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

    _itemSelected = (item: SearchDirectory_SearchDirectory_nodes) => {
        this.props.addStructureSearch(item.name);

        if (item.__typename === 'Club') {
            this.props.showClub(item.id);
        }

        if (item.__typename === 'Association') {
            this.props.showAssociation(item.id, item.name);
        }

        if (item.__typename === 'Area') {
            this.props.showArea(item.id);
        }
        // this.props.showProfile(item.id);
    }

    _showFilterDialog = () => {
        this.audit.increment(MetricNames.ShowFilterDialog);

        if (this._searchBar) { this._searchBar.blur(); }
        this.setState({ showFilter: !this.state.showFilter });
    }

    _onToggleFamily = (type: FilterTagType, value: string, id?: string) => {
        const tags = this._onToggleTag(type, value, id, false);

        const family = tags.filter((t) => t.type === 'family');
        if (family.length > 0 || family.length === 0) {
            remove(tags, (f: FilterTag) =>
                f.type === 'association' || f.type === 'role' || f.type === 'area' || f.type === 'table');
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

    toggleChip(type: FilterTagType, value: string) {
        if (type === 'family') { this._onToggleFamily(type, value); }
        else { this._onToggleTag(type, value); }
    }

    sortTags(o: FilterTag) {
        return SortMap[o.type] || o.type;
    }

    render() {
        return (
            <Screen>
                {!this.state.searching && (
                    <ScrollView>
                        <AssociationsList expanded={this.props.navigation.getParam('expandAssociations')} />
                        <SearchHistory applyFilter={this.searchFilterFunction} />
                    </ScrollView>
                )}

                {this.state.searching && this.state.filterTags.length > 0 && (
                    <TouchableWithoutFeedback onPress={this._showFilterDialog}>
                        <>
                            <View style={[styles.chips, { backgroundColor: this.props.theme.colors.primary }]}>
                                {
                                    sortBy(this.state.filterTags, [this.sortTags, 'value']).map((f: FilterTag) => (
                                        <Chip
                                            style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                                            key={`${f.type}:${f.value}`}
                                            selected={true}
                                            selectedColor={this.props.theme.colors.textOnAccent}
                                            onPress={() => this.toggleChip(f.type, f.value)}
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

                {this.state.searching && this.props.offline && (
                    <CannotLoadWhileOffline />
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
                    toggleFamily={this._onToggleFamily}
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
export const SearchStructureScreen = connect(
    (state: IAppState) => ({
        offline: state.connection.offline,
    }),
    {
        showClub,
        showAssociation,
        showArea,
        addStructureSearch,
    },
)(
    withWhoopsErrorBoundary(
        withTheme(
            withNavigation(SearchStructureScreenBase)),
    ),
);
