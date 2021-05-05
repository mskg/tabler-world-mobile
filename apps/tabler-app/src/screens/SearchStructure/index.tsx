import { debounce, remove } from 'lodash';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar, Searchbar, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { MetricNames } from '../../analytics/MetricNames';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { FilterTag, FilterTagType } from '../../components/FilterSection';
import { StandardHeader } from '../../components/Header';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Screen } from '../../components/Screen';
import { I18N } from '../../i18n/translation';
import { SearchDirectory_SearchDirectory_nodes } from '../../model/graphql/SearchDirectory';
import { IAppState } from '../../model/IAppState';
import { addStructureSearch } from '../../redux/actions/history';
import { showArea, showAssociation, showClub } from '../../redux/actions/navigation';
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
    theme: Theme,
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
    }

    componentWillUnmount() {
        this.mounted = false;
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

    render() {
        return (
            <Screen>
                {!this.state.searching && (
                    <ScrollView>
                        <AssociationsList expanded={this.props.navigation.getParam('expandAssociations')} />
                        <SearchHistory applyFilter={this.searchFilterFunction} />
                    </ScrollView>
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
