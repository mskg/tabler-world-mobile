import { debounce } from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { Searchbar, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { MetricNames } from '../../analytics/MetricNames';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { StandardHeader } from '../../components/Header';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Screen } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { IAppState } from '../../model/IAppState';
import { addTablerSearch } from '../../redux/actions/history';
import { newConversation } from '../../redux/actions/navigation';
import { HeaderStyles } from '../../theme/dimensions';
import { logger } from './logger';
import { OnlineSearchQuery } from './OnlineSearch';
import { styles } from './styles';

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
    sortBy: string,
    fetchPolicy: any,
    offline: boolean,
};

type DispatchPros = {
    addTablerSearch: typeof addTablerSearch;
    newConversation: typeof newConversation;
};

type Props = OwnProps & StateProps & DispatchPros;

class SearchChatPartnerScreenBase extends AuditedScreen<Props, State> {
    mounted = true;

    state: State = {
        query: '',
        debouncedQuery: '',

        searching: false,
        update: false,
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

        logger.debug('Logged');
        this.audit.submit();
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

    _itemSelected = (item) => {
        this.props.addTablerSearch(this.state.query);
        this.props.newConversation(
            item.id,
            `${item.firstname} ${item.lastname}`);
    }

    render() {
        return (
            <Screen>
                {this.state.searching && this.props.offline &&
                    <CannotLoadWhileOffline />
                }

                {this.state.searching && !this.props.offline && (
                    <OnlineSearchQuery
                        query={this.state.debouncedQuery}
                        filterTags={[]}
                        itemSelected={this._itemSelected}
                        availableForChat={true}
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
export const SearchChatPartnerScreen = connect(
    (state: IAppState) => ({
        sortBy: state.settings.sortByLastName ? 'lastname' : 'firstname',
        offline: state.connection.offline,
    }),
    {
        addTablerSearch,
        newConversation,
    },
)(
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'utility',
            withTheme(SearchChatPartnerScreenBase),
        ),
    ),
);
