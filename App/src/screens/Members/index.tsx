import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Vibration } from 'react-native';
import { Appbar, Colors, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { AlphabeticScrollBar } from '../../components/AlphabetJumpbar';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { renderItem } from '../../components/ListRenderer';
import { MemberSectionList } from '../../components/MemberSectionList';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { ScreenWithHeader } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { MeFragment } from '../../model/graphql/MeFragment';
import { MembersByAreas, MembersByAreasVariables } from '../../model/graphql/MembersByAreas';
import { OfflineMembers } from '../../model/graphql/OfflineMembers';
import { IAppState } from '../../model/IAppState';
import { IMemberOverviewFragment } from "../../model/IMemberOverviewFragment";
import { HashMap } from '../../model/Maps';
import { GetMembersByAreasQuery } from "../../queries/GetMembersByAreasQuery";
import { GetOfflineMembersQuery } from '../../queries/GetOfflineMembersQuery';
import { showFilter, showSearch } from '../../redux/actions/navigation';
import { TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';
import { MemberDataSource } from './MemberDataSource';
import { MemberListPlaceholder } from "./MemberListPlaceholder";
import { Predicates } from './Predicates';

const logger = new Logger(Categories.Screens.Contacts);

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

type Props = OwnProps & StateProps & DispatchPros;

class MembersScreenBase extends AuditedScreen<Props, State> {
    _sectionList!: any;

    constructor(props: Props) {
        super(props, AuditScreenName.MemberList);

        const dataSource = new MemberDataSource([]);
        dataSource.sortBy = this.props.sortBy;
        dataSource.groupBy = this.props.sortBy;

        this.state = {
            dataSource,
            forceUpdate: false,
            letter: _.first(dataSource.sections),
        };

        this.state = {
            ...this.state,
            ...this.calculateNewState(props),
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        // const forceUpdate = false
        //     || this.props.data.Me != nextProps.data.Me
        //     || this.props.showFavorites != nextProps.showFavorites
        //     || (this.props.showOwntable != nextProps.showOwntable && nextProps.data.Me != null)
        //     || this.props.areas != nextProps.areas
        //     || this.props.sortBy != nextProps.sortBy
        //     || this.props.diplayFirstNameFirst != nextProps.diplayFirstNameFirst
        //     || this.props.theme != nextProps.theme;

        const forceUpdate = true;
        this.setState({
            ...this.calculateNewState(nextProps),
            forceUpdate: !this.state.forceUpdate,
        });
    }

    calculateNewState(nextProps: Props) {
        logger.debug("componentWillReceiveProps",
            "fav?", nextProps.showFavorites,
            "own?", nextProps.showOwntable,
            "areas", nextProps.areas);

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
            nextProps.showOwntable && me != null && me.club != null ? Predicates.sametable(me.club.club) : null,
            nextProps.areas != null ? Predicates.area(nextProps.areas) : Predicates.all,
            nextProps.showAreaBoard ? Predicates.areaBoard() : null,
            nextProps.showAssociationBoard ? Predicates.associationBoard() : null,
        );
        this.state.dataSource.sortBy = nextProps.sortBy;
        this.state.dataSource.groupBy = nextProps.sortBy;

        this.state.dataSource.update(
            _(data).uniqBy(d => d.id).value() as IMemberOverviewFragment[]
        );

        const res = this.state.dataSource.data.filter(s => s.title == this.state.letter);

        return {
            letter: res != null && res.length !== 0
                ? this.state.letter
                : _.first(this.state.dataSource.sections),
            me,
        };
    }

    _jumptoLetterDirect = (letter: string | undefined): void => {
        if (letter == null || letter == this.state.letter) return;
        this.setState({ letter: letter });

        if (this._sectionList != null && letter != null) {
            logger.debug("_jumptoLetterDirect", letter);

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
                <ScreenWithHeader header={
                    {
                        content:
                            [
                                <Appbar.Content key="cnt" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={I18N.Members.title} />,
                                <Appbar.Action key="filter" icon="filter-list" onPress={() => this.props.showFilter()} />,
                                <Appbar.Action key="search" icon="search" onPress={() => this.props.showSearch()} />,
                            ]
                    }
                }>
                    <Placeholder ready={
                        this.props.data != null
                        && this.props.data.MembersOverview != null
                        && this.props.data.Me != null
                        && (
                            !this.props.loading
                            || this.state.dataSource.data != null
                        )
                    } previewComponent={<MemberListPlaceholder />}>
                        <MemberSectionList
                            setRef={ref => this._sectionList = ref}
                            extraData={this.state.forceUpdate}
                            me={this.state.me}
                            refreshing={this.props.loading}
                            data={this.state.dataSource.data}
                            onRefresh={this.props.refresh}
                        />

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

const ConnectedMembersScreen = connect(
    (state: IAppState): StateProps => ({
        showFavorites: state.filter.member.showFavorites,
        showOwntable: state.filter.member.showOwntable,
        showAssociationBoard: state.filter.member.showAssociationBoard,
        showAreaBoard: state.filter.member.showAreaBoard,

        areas: state.filter.member.area,
        favorites: state.filter.member.favorites,

        sortBy: state.settings.sortByLastName ? "lastname" : "firstname",
        diplayFirstNameFirst: state.settings.diplayFirstNameFirst,
    }),
    {
        showSearch,
        showFilter,
    }
)(withTheme(MembersScreenBase));

// processing time is too slow if we add the @client directive
// to a query with many records.
const MembersQuery = ({ fetchPolicy, areas, showAssociationBoard, showAreaBoard, offline }) => (
    <Query<OfflineMembers>
        query={GetOfflineMembersQuery}
        fetchPolicy={fetchPolicy}
    >
        {({ loading: oLoading, data: oData, error: oError, refetch: oRefetch }) => {
            if (!oLoading && (oData == null || oData.OwnTable == null || oData.FavoriteMembers == null)) {
                if (offline) {
                    return <CannotLoadWhileOffline />;
                }

                setTimeout(() => {
                    oRefetch();
                });
            }

            return <Query<MembersByAreas, MembersByAreasVariables>
                query={GetMembersByAreasQuery}
                fetchPolicy={fetchPolicy}
                variables={{
                    areas: areas != null ? _(areas)
                        .keys()
                        .filter(k => k !== "length")
                        .map(a => a.replace(/[^\d]/g, ""))
                        .map(a => parseInt(a, 10))
                        .value()
                        : null,

                    board: showAssociationBoard,
                    areaBoard: showAreaBoard,
                }}
            >
                {({ loading, data, error, refetch }) => {
                    let isLoading = loading || oLoading;

                    if (error || oError) throw (error || oError);
                    if (!loading && (data == null || data.MembersOverview == null)) {
                        setTimeout(() => {
                            refetch();
                        });

                        isLoading = true;
                    }

                    return <ConnectedMembersScreen
                        loading={isLoading}
                        data={data}
                        offlineData={oData}
                        refresh={() => { refetch(); oRefetch(); }} />
                }}
            </Query>
        }}
    </Query>
);

const MembersQueryWithCacheInvalidation = withCacheInvalidation(
    "members",
    connect((s: IAppState) => ({
        areas: s.filter.member.area,
        showAssociationBoard: s.filter.member.showAssociationBoard,
        showAreaBoard: s.filter.member.showAreaBoard,
        offline: s.connection.offline,
    }))(MembersQuery)
);

export const MembersScreen = withWhoopsErrorBoundary(MembersQueryWithCacheInvalidation);
