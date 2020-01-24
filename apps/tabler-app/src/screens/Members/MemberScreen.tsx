import _, { first } from 'lodash';
import React from 'react';
import { Dimensions, StatusBar, StyleSheet, Vibration, View } from 'react-native';
import { Appbar, Colors, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { RecyclerListView } from 'recyclerlistview';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { AlphabeticScrollBar } from '../../components/AlphabetJumpbar';
import { renderItem } from '../../components/ListRenderer';
import { MemberSectionList } from '../../components/MemberSectionList';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { TapOnNavigationParams } from '../../components/ReloadNavigationOptions';
import { ScreenWithHeader } from '../../components/Screen';
import { I18N } from '../../i18n/translation';
import { MeFragment } from '../../model/graphql/MeFragment';
import { MembersByAreas } from '../../model/graphql/MembersByAreas';
import { OfflineMembers } from '../../model/graphql/OfflineMembers';
import { IAppState } from '../../model/IAppState';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { HashMap } from '../../model/Maps';
import { showFilter, showSearch } from '../../redux/actions/navigation';
import { BOTTOM_HEIGHT, TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';
import { logger } from './logger';
import { MemberDataSource } from './MemberDataSource';
import { MemberListPlaceholder } from './MemberListPlaceholder';
import { Predicates } from './Predicates';

type State = {
    letter: string | undefined,
    forceUpdate: boolean,
    dataSource: MemberDataSource,
    me?: MeFragment,
};

type OwnProps = {
    theme: Theme,

    data?: MembersByAreas,
    offlineData?: OfflineMembers,

    loading: boolean,

    refresh: () => any,
};

type StateProps = {
    areas: HashMap<boolean, string> | null,
    favorites: HashMap<boolean>,
    showFavorites: boolean,
    showOwntable: boolean,
    showAreaBoard: boolean,
    showAssociationBoard: boolean,

    sortBy: string,
    diplayFirstNameFirst: boolean,
};

type DispatchPros = {
    showSearch: typeof showSearch;
    showFilter: typeof showFilter;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<TapOnNavigationParams>;

class MembersScreenBase extends AuditedScreen<Props, State> {
    _sectionList!: RecyclerListView<any, any>;

    constructor(props: Props) {
        super(props, AuditScreenName.MemberList);

        const dataSource = new MemberDataSource([]);
        dataSource.sortBy = this.props.sortBy;
        dataSource.groupBy = this.props.sortBy;

        this.state = {
            dataSource,
            forceUpdate: false,
            letter: first(dataSource.sections),
        };

        this.state = {
            ...this.state,
            ...this.calculateNewState(props),
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({
            tapOnTabNavigator: () => {
                requestAnimationFrame(
                    () => this._sectionList.scrollToOffset(0, 0, true),
                );

                if (this.props.data == null || this.props.data.MembersOverview == null || this.props.data.MembersOverview.length === 0) {
                    this.props.refresh();
                }
            },
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps === this.props) {
            return;
        }

        // const forceUpdate = true;
        this.setState({
            ...this.calculateNewState(this.props),
            forceUpdate: !this.state.forceUpdate,
        });
    }

    calculateNewState(nextProps: Props) {
        if (__DEV__) {
            logger.debug(
                'calculateNewState',
                'fav?', nextProps.showFavorites,
                'own?', nextProps.showOwntable,
                'areas', nextProps.areas);
        }

        const data = nextProps.data != null && nextProps.data.MembersOverview != null
            ? nextProps.data.MembersOverview
            : [];

        if (nextProps.offlineData && nextProps.offlineData.OwnTable != null) {
            data.push(...nextProps.offlineData.OwnTable);
        }

        if (nextProps.offlineData && nextProps.offlineData.FavoriteMembers != null) {
            data.push(...nextProps.offlineData.FavoriteMembers);
        }

        const me = nextProps.data != null && nextProps.data.Me != null ? nextProps.data.Me : undefined;
        logger.debug(me);

        this.state.dataSource.filter = Predicates.or(
            nextProps.showFavorites ? Predicates.favorite(this.props.favorites) : null,
            nextProps.showOwntable && me != null && me.club != null ? Predicates.sametable(me.club.id) : null,
            nextProps.areas != null ? Predicates.area(nextProps.areas) : Predicates.all,
            nextProps.showAreaBoard ? Predicates.areaBoard() : null,
            nextProps.showAssociationBoard ? Predicates.associationBoard() : null,
        );
        this.state.dataSource.sortBy = nextProps.sortBy;
        this.state.dataSource.groupBy = nextProps.sortBy;

        this.state.dataSource.update(
            _(data).uniqBy((d) => d.id).value() as IMemberOverviewFragment[],
        );

        const res = this.state.dataSource.data.filter((s) => s.title === this.state.letter);

        return {
            me,
            letter: res != null && res.length !== 0
                ? this.state.letter
                : first(this.state.dataSource.sections),
        };
    }

    _jumptoLetterDirect = (letter: string | undefined): void => {
        if (letter == null || letter === this.state.letter) return;
        this.setState({ letter });

        if (this._sectionList != null && letter != null) {
            if (__DEV__) { logger.debug('_jumptoLetterDirect', letter); }

            requestAnimationFrame(() => {
                if (this._sectionList != null) {
                    this._sectionList.scrollToItem(letter, false);
                    Vibration.vibrate([0], false);
                }
            });
        }
    }

    _renderItem = (item, onPress) => renderItem(item, this.props.theme, onPress, 30);

    render() {
        return (
            <React.Fragment>
                <ScreenWithHeader
                    header={
                        {
                            content: [
                                <Appbar.Content key="cnt" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={I18N.Members.title} />,
                                <Appbar.Action key="filter" icon="filter-list" onPress={() => this.props.showFilter()} />,
                                <Appbar.Action key="search" icon="search" onPress={() => this.props.showSearch()} />,
                            ],
                        }
                    }
                >
                    <Placeholder
                        ready={
                            this.props.data != null
                            && this.props.data.MembersOverview != null
                            && this.props.data.Me != null
                            && (
                                !this.props.loading
                                || this.state.dataSource.data != null
                            )
                        }
                        previewComponent={<MemberListPlaceholder />}
                    >
                        <View style={styles.sectionList}>
                            <MemberSectionList
                                setRef={(ref) => this._sectionList = ref}
                                extraData={this.state.forceUpdate}
                                me={this.state.me}
                                refreshing={this.props.loading}
                                data={this.state.dataSource.data}
                                onRefresh={this.props.refresh}
                                style={styles.sectionList}
                            />
                        </View>

                        <AlphabeticScrollBar
                            isPortrait={false}
                            reverse={false}
                            font={this.props.theme.fonts.medium}
                            fontColor={Colors.lightBlue700}
                            top={TOTAL_HEADER_HEIGHT}
                            fontSize={11}
                            supports={this.state.dataSource.sections}
                            onScroll={this._jumptoLetterDirect}
                        />
                    </Placeholder>
                </ScreenWithHeader>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    sectionList: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - TOTAL_HEADER_HEIGHT - BOTTOM_HEIGHT + (StatusBar.currentHeight || 0),
    },
});

export const MemberScreen = connect(
    (state: IAppState): StateProps => ({
        showFavorites: state.filter.member.showFavorites,
        showOwntable: state.filter.member.showOwntable,
        showAssociationBoard: state.filter.member.showAssociationBoard,
        showAreaBoard: state.filter.member.showAreaBoard,

        areas: state.filter.member.area,
        favorites: state.filter.member.favorites,

        sortBy: state.settings.sortByLastName ? 'lastname' : 'firstname',
        diplayFirstNameFirst: state.settings.diplayFirstNameFirst,
    }),
    {
        showSearch,
        showFilter,
    },
)(withTheme(withNavigation(MembersScreenBase)));

