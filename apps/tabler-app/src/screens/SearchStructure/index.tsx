import { debounce } from 'lodash';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Searchbar, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { MetricNames } from '../../analytics/MetricNames';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { StandardHeader } from '../../components/Header';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Screen } from '../../components/Screen';
import { I18N } from '../../i18n/translation';
import { SearchDirectory_SearchDirectory_nodes } from '../../model/graphql/SearchDirectory';
import { IAppState } from '../../model/IAppState';
import { addStructureSearch } from '../../redux/actions/history';
import { showAssociation, showClub } from '../../redux/actions/navigation';
import { HeaderStyles } from '../../theme/dimensions';
import { AssociationsList } from './AssociationsList';
import { logger } from './logger';
import { OnlineSearchQuery } from './OnlineSearch';
import { SearchHistory } from './SearchHistory';
import { styles } from './styles';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';

type State = {
    searching: boolean,
    query: string,
    debouncedQuery: string,
    update: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    offline: boolean,
};

type DispatchPros = {
    showClub: typeof showClub;
    showAssociation: typeof showAssociation;
    addStructureSearch: typeof addStructureSearch;
};

type NavigationParams = {
    expandAssociations?: boolean,
}

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<NavigationParams>;

class SearchStructureScreenBase extends AuditedScreen<Props, State> {
    mounted = true;

    state: State = {
        query: '',
        debouncedQuery: '',

        searching: false,
        update: false,
    };

    constructor(props) {
        super(props, AuditScreenName.StructureSearch);
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
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    _searchBar!: Searchbar | null;

    _adjustSearch = debounce(
        (text) => {
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
            this._adjustSearch(text);
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
            this.props.showAssociation(item.association.id, item.association.name);
        }
        // this.props.showProfile(item.id);
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
                        itemSelected={this._itemSelected}
                    />
                )}

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
                                    onChangeText={(text) => this.searchFilterFunction(text)}
                                />
                            </View>
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
        addStructureSearch,
    },
)(
    withWhoopsErrorBoundary(
        withTheme(
            withNavigation(SearchStructureScreenBase)),
    ),
);
