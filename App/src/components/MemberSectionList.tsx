import React from 'react';
import { Dimensions, Platform, RefreshControl, StyleSheet } from "react-native";
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from "react-navigation";
import { connect } from 'react-redux';
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview';
import StickyContainer from 'recyclerlistview/dist/reactnative/core/StickyContainer';
import { Logger } from '../helper/Logger';
import { I18N } from '../i18n/translation';
import { MeFragment } from '../model/graphql/MeFragment';
import { IMemberOverviewFragment } from "../model/IMemberOverviewFragment";
import { IWhoAmI } from '../model/IWhoAmI';
import { showProfile } from '../redux/actions/navigation';
import { SectionData } from '../screens/Members/MemberDataSource';
import { SECTION_HEIGHT } from './List/Section';
import { renderItem } from './ListRenderer';
import { FullScreenLoading } from './Loading';
import { MeListItem, ME_ITEM_HEIGHT } from './MeListItem';
import { CHIP_HEIGHT, ITEM_HEIGHT, ITEM_HEIGHT_TAGS } from './Member/Dimensions';
import { EmptyComponent } from './NoResults';

type State = {
    data: any[],
    sectionIndexes: number[] | undefined,
};

type OwnProps = {
    theme: Theme,
    me?: MeFragment,
    data: SectionData,

    extraData?: any,
    refreshing: boolean,

    onRefresh?: () => void,
    onItemSelected?: (member: IMemberOverviewFragment) => void,

    setRef?: (ref) => void;
};

type DispatchPros = {
    showProfile: typeof showProfile,
};

type Props = OwnProps & DispatchPros & NavigationInjectedProps;
const ME_ITEM = "###ME###";

enum ItemType {
    Me,
    Section,
    Small,
    Large,
    Large2,
    Large3,
    Unknown,
}

const logger = new Logger("MemberSectionList");
const SCREEN_FACTOR = Dimensions.get("screen").width / 375 /* 6S */;

export class MemberSectionListBase extends React.Component<Props, State>  {
    dataProvider: DataProvider;
    layoutProvider: LayoutProvider;
    width = Dimensions.get("screen").width;

    constructor(props) {
        super(props);

        // we always reset everything, we can compare to wrong
        this.dataProvider = new DataProvider(() => true);

        this.layoutProvider = new LayoutProvider(
            index => {
                if (index > this.state.data.length) return ItemType.Unknown;

                const data = this.state.data[index];
                if (typeof (data) === "string") {
                    if (data === ME_ITEM) { return ItemType.Me }
                    else { return ItemType.Section; }
                } else {
                    const roles = (data != null && (data as IMemberOverviewFragment).roles) || [];
                    if (roles.length == 0) return ItemType.Small;

                    const length = roles.reduce(
                        (p,c) => (p > 0 ? 3 : 0) + p + (c.name||"").length + ((c.ref || {name: ""}).name || "").length,
                        0);

                    // this kills the performance of the "debugger" as
                    // code is executed many many times in every render cycle
                    // if (__DEV__) { logger.debug((data as IMemberOverviewFragment).lastname, length); }
                    if (length > 47*2 * SCREEN_FACTOR) return ItemType.Large3;
                    if (length > 47 * SCREEN_FACTOR) return ItemType.Large2;

                    return ItemType.Large;
                }
            },

            this._getLayout,
        );

        this.layoutProvider.shouldRefreshWithAnchoring = false;

        this.state = {
            sectionIndexes: undefined,
            data: [],
        };
    }

    _getLayout =  (type, dimension) => {
        dimension.width = this.width;

        switch (type) {
            case ItemType.Me:
                dimension.height = ME_ITEM_HEIGHT;
                break;

            case ItemType.Section:
                dimension.height = SECTION_HEIGHT;
                break;

            case ItemType.Large:
                dimension.height = ITEM_HEIGHT_TAGS + StyleSheet.hairlineWidth;
                break;

            case ItemType.Large2:
                dimension.height = ITEM_HEIGHT_TAGS + CHIP_HEIGHT + StyleSheet.hairlineWidth;
                break;

            case ItemType.Large3:
                dimension.height = ITEM_HEIGHT_TAGS + CHIP_HEIGHT*2 + StyleSheet.hairlineWidth;
                break;

            default:
                dimension.height = ITEM_HEIGHT + StyleSheet.hairlineWidth;
                break;
        };
    };

    componentDidMount() {
        this.updateFrom(this.props);
    }

    updateFrom(props: Props) {
        const newData: any[] = [];
        const sections: number[] = [];

        const canShowMe = props.me != null && props.me.firstname;
        if (canShowMe) {
            newData.push(ME_ITEM);
        }

        for (const section of props.data) {
            sections.push(newData.length);

            newData.push(section.title);
            newData.push(...section.data);
        }

        this.setState({
            sectionIndexes: undefined
        });

        this.setState({
            data: newData,
            sectionIndexes: sections
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.extraData != this.props.extraData) {
            logger.log("Update!");
            this.updateFrom(nextProps);
        }
    }

    _onPress = (item) => {
        if (this.props.onItemSelected != null) {
            this.props.onItemSelected(item);
        }
        else {
            this.props.showProfile(item.id);
        }
    };

    _rowRenderer = (type, data, index) => {
        // on resetting data, we receive old data here
        if (data == null) return null;

        if (data === ME_ITEM) {
            return <MeListItem theme={this.props.theme} me={this.props.me as IWhoAmI} />;
        }

        let height: number | undefined = undefined;

        if (Platform.OS === "android") {
            const dimension = {height: 0, width: 0};
            this._getLayout(type, dimension);
            height = dimension.height - StyleSheet.hairlineWidth;
        }

        // workarround for Android
        // hight must be explicitly given
        return renderItem(data, this.props.theme, this._onPress, 30, height);
    }


    render() {
        if (this.props.data.length == 0 && !this.props.me) {
            if (this.props.refreshing) return <FullScreenLoading />

            return (<EmptyComponent title={I18N.Members.noresults} />);
        }

        return (
            <StickyContainer stickyHeaderIndices={this.state.sectionIndexes}>
                <RecyclerListView
                    ref={this.props.setRef}

                    initialOffset={0}
                    initialRenderIndex={0}

                    layoutProvider={this.layoutProvider}
                    dataProvider={this.dataProvider.cloneWithRows(this.state.data, 0)}
                    rowRenderer={this._rowRenderer}

                    scrollViewProps={{
                        refreshing: this.props.refreshing,
                        refreshControl: (
                            <RefreshControl
                                refreshing={this.props.refreshing}
                                onRefresh={this.props.onRefresh}
                            />
                        )
                    }}
                />
            </StickyContainer>
        );
    }
}

export const MemberSectionList = withNavigation(withTheme(connect(
    null, {
        showProfile,
    })(MemberSectionListBase)));
