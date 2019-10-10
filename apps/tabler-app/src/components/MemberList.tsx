import React from 'react';
import { FlatList, Platform } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { I18N } from '../i18n/translation';
import { IMemberOverviewFragment } from '../model/IMemberOverviewFragment';
import { IWhoAmI } from '../model/IWhoAmI';
import { showProfile } from '../redux/actions/navigation';
import { extractKey, renderDivider, renderItem } from './ListRenderer';
import { MeListItem } from './MeListItem';
import { EmptyComponent } from './NoResults';

type OwnProps = {
    theme: Theme,

    section?: string,
    me?: IWhoAmI,

    data: IMemberOverviewFragment[],
    extraData?: any,

    refreshing?: boolean,
    onRefresh?: () => void,

    renderItem?: (member: IMemberOverviewFragment, onPress: any) => React.ReactElement | null,
    onItemSelected?: (member: IMemberOverviewFragment) => void,

    onEndReached?: () => any;
};

type DispatchPros = {
    showProfile: typeof showProfile,
};

type Props = OwnProps & DispatchPros & NavigationInjectedProps;

export class MemberListBase extends React.Component<Props> {
    _flatList!: FlatList<IMemberOverviewFragment> | null;

    constructor(props: Props) {
        super(props);
    }

    _onPress = (item: IMemberOverviewFragment) => {
        if (this.props.onItemSelected != null) {
            this.props.onItemSelected(item);
        } else {
            this.props.showProfile(item.id);
        }
    }

    _renderItem = ({ item }): React.ReactElement | null => {
        return this.props.renderItem != null
            ? this.props.renderItem(item, this._onPress)
            : renderItem(item, this.props.theme, this._onPress);
    }

    // _getItemLayout = (_data, index) => {
    //     const firstHeight = this.props.me != null ? ME_ITEM_HEIGHT : ITEM_HEIGHT;

    //     return {
    //         index,
    //         length: index === 0 ? firstHeight : ITEM_HEIGHT,
    //         offset: (ITEM_HEIGHT + StyleSheet.hairlineWidth) * index + (index > 0 ? firstHeight - ITEM_HEIGHT : 0),
    //     };
    // }

    _renderHeader = () => {
        const { me } = this.props;
        const canShowMe = me != null && me.firstname;

        return canShowMe ? <MeListItem theme={this.props.theme} me={this.props.me as IWhoAmI} /> : null;
    }

    _renderDivider = () => renderDivider(this.props.theme);

    render() {
        return (
            <FlatList
                ref={(fl) => this._flatList = fl}
                extraData={this.props.extraData}

                scrollEventThrottle={16}
                ItemSeparatorComponent={this._renderDivider}

                removeClippedSubviews={Platform.OS !== 'ios'}

                ListHeaderComponent={this._renderHeader}
                renderItem={this._renderItem}
                // getItemLayout={this._getItemLayout}
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

export const MemberList = withNavigation(withTheme(connect(
    null, {
    showProfile,
})(MemberListBase)));
