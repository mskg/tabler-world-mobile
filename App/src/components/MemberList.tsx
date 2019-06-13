import React from 'react';
import { FlatList, ListRenderItemInfo, Platform } from "react-native";
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from "react-navigation";
import { connect, MapStateToProps } from 'react-redux';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { IMember } from '../model/IMember';
import { IWhoAmI } from '../model/IWhoAmI';
import { showProfile } from '../redux/actions/navigation';
import { extractKey, renderDivider, renderItem } from './ListRenderer';
import { MeListItem, ME_ITEM_HEIGHT } from "./MeListItem";
import { ITEM_HEIGHT } from './Member/Dimensions';
import { EmptyComponent } from './NoResults';

type OwnProps = {
    theme: Theme,

    section?: string,
    showMe: boolean,

    data: IMember[],
    extraData?: any,

    refreshing?: boolean,
    onRefresh?: () => void,

    renderItem?: (member: IMember, onPress: any) => React.ReactNode,
    onItemSelected?: (member: IMember) => void,

    onEndReached?: () => any;
};

type StateProps = {
    me: IWhoAmI | undefined,
};

type DispatchPros = {
    showProfile: typeof showProfile
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

export class MemberListBase extends React.Component<Props> {
    _flatList!: FlatList<IMember> | null;

    constructor(props: Props) {
        super(props);
    }

    _onPress = (item: IMember) => {
        if (this.props.onItemSelected != null) {
            this.props.onItemSelected(item);
        }
        else {
            this.props.showProfile(item.id);
        }
    };

    _renderItem = (c: ListRenderItemInfo<IMember>) => {
        return this.props.renderItem != null ?
            this.props.renderItem(c.item, this._onPress)
            : renderItem(c.item, this.props.theme, this._onPress);
    }

    _getItemLayout = (_data, index) => {
        const firstHeight = this.props.showMe ? ME_ITEM_HEIGHT : ITEM_HEIGHT;

        return {
            length: index == 0 ? firstHeight : ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index + (index > 0 ? firstHeight - ITEM_HEIGHT : 0),
            index,
        }
    };

    _renderHeader = () => {
        const { me, showMe } = this.props;
        const canShowMe = me != null && me.firstname && showMe;

        return canShowMe ? <MeListItem theme={this.props.theme} me={this.props.me as IWhoAmI} /> : null;
    };

    _renderDivider = () => renderDivider(this.props.theme);

    render() {
        return (
            <FlatList
                ref={(fl) => this._flatList = fl}
                extraData={this.props.extraData}

                scrollEventThrottle={16}
                ItemSeparatorComponent={this._renderDivider}

                removeClippedSubviews={Platform.OS !== "ios"}

                ListHeaderComponent={this._renderHeader}
                renderItem={this._renderItem}
                getItemLayout={this._getItemLayout}
                ListEmptyComponent={this.props.refreshing ? undefined : <EmptyComponent title={I18N.Members.noresults} />}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 56 + 10 }}

                keyExtractor={extractKey}

                data={this.props.data}

                refreshing={this.props.refreshing}
                onRefresh={this.props.onRefresh}

                onEndReached={this.props.onEndReached}
                onEndReachedThreshold={0.5}
            />
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IAppState> = (state: IAppState): StateProps => {
    return {
        me: state.auth.user,
    }
};

export const MemberList = withNavigation(withTheme(connect(
    mapStateToProps, {
        showProfile
    })(MemberListBase)));
