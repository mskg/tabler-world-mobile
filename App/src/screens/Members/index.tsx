import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Vibration } from 'react-native';
import { Appbar, Colors, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from "react-navigation";
import { connect, MapStateToProps } from 'react-redux';
import { Audit } from "../../analytics/Audit";
import { IAuditor } from '../../analytics/Types';
import { AlphabeticScrollBar } from '../../components/AlphabetJumpbar';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { renderItem } from '../../components/ListRenderer';
import { MemberSectionList } from '../../components/MemberSectionList';
import { ScreenWithHeader } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { IAppState } from '../../model/IAppState';
import { IMemberOverviewFragment } from "../../model/IMemberOverviewFragment";
import { IWhoAmI } from '../../model/IWhoAmI';
import { HashMap } from '../../model/Maps';
import { showFilter, showSearch } from '../../redux/actions/navigation';
import { TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';
import { MemberDataSource } from './MemberDataSource';
import { Predicates } from './Predicates';
import { GetMembersQuery, GetMembersQueryType } from './Queries';

const logger = new Logger(Categories.Screens.Contacts);

type State = {
    letter: string | undefined,
    forceUpdate: boolean,
    dataSource: MemberDataSource,
    me?: IWhoAmI,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    data: GetMembersQueryType,

    loading: boolean,
    refresh: () => any,

    areas: HashMap<boolean, string> | null,
    favorites: HashMap<boolean>,
    showFavorites: boolean,
    showOwntable: boolean,
    lastSync: Date | null,

    sortBy: string,
    diplayFirstNameFirst: boolean,
};

type DispatchPros = {
    showSearch: typeof showSearch;
    showFilter: typeof showFilter;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

export class MembersScreenBase extends React.Component<Props, State> {
    _sectionList!: any;
    audit: IAuditor;

    constructor(props: Props) {
        super(props);

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

        this.audit = Audit.screen("Members");
    }

    componentDidMount() {
        this.audit.submit();
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

        const data = nextProps.data != null && nextProps.data.MembersOverview != null ? nextProps.data.MembersOverview : [];
        const me = nextProps.data != null && nextProps.data.Me != null ? nextProps.data.Me : undefined;
        logger.debug(me);

        this.state.dataSource.filter = Predicates.or(
            nextProps.showFavorites ? Predicates.favorite(this.props.favorites) : null,
            nextProps.showOwntable && me != null && me.club != null ? Predicates.sametable(me.club.club) : null,
            nextProps.areas != null ? Predicates.area(nextProps.areas) : Predicates.all,
        );

        this.state.dataSource.sortBy = nextProps.sortBy;
        this.state.dataSource.groupBy = nextProps.sortBy;

        this.state.dataSource.update(data as IMemberOverviewFragment[]);

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
                    <MemberSectionList
                        setRef={ref => this._sectionList = ref}
                        extraData={this.state.forceUpdate}
                        showMe={true}
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
                </ScreenWithHeader>
            </React.Fragment>
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IAppState> = (state: IAppState): StateProps => {
    return {
        showFavorites: state.filter.member.showFavorites,
        showOwntable: state.filter.member.showOwntable,

        areas: state.filter.member.area,
        favorites: state.filter.member.favorites,

        sortBy: state.settings.sortByLastName ? "lastname" : "firstname",
        diplayFirstNameFirst: state.settings.diplayFirstNameFirst,
    }
};

const ConnectedMembersScreen = connect(
    mapStateToProps, {
        showSearch,
        showFilter,
    })(withNavigation(withTheme(MembersScreenBase)));


const WithQuery = ({ fetchPolicy }) => (
    <Query<GetMembersQueryType> query={GetMembersQuery} fetchPolicy={fetchPolicy}>
        {({ loading, data, error, refetch }) => {
            logger.debug("render");
            let isLoading = loading;

            if (error) throw error;
            if (!loading && (data == null || data.MembersOverview == null)) {
                setTimeout(() => {
                    logger.debug("********** Refetching");
                    refetch();
                });

                isLoading = true;
            }

            return <ConnectedMembersScreen loading={isLoading} data={data} refresh={refetch} />
        }}
    </Query>
);

export const MembersScreen = withWhoopsErrorBoundary(withCacheInvalidation("members", WithQuery));
