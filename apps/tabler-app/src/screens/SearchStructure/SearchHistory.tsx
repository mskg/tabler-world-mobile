import React from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { Divider, List, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { I18N } from '../../i18n/translation';
import { IAppState } from '../../model/IAppState';
import { isIphoneX } from '../../helper/isIphoneX';

type State = {
};

type OwnProps = {
    theme: Theme,
    applyFilter: (text: string) => void,
};

type StateProps = {
    history: string[],
};

type DispatchPros = {
};

type Props = OwnProps & StateProps & DispatchPros;

class SearchHistoryBase extends React.Component<Props, State> {
    _renderSearchHistoryItem = (c: { item: string }) => (
        <React.Fragment key={c.item}>
            <List.Item
                style={{ backgroundColor: this.props.theme.colors.surface }}
                // workarround
                title={<Text style={{ fontSize: 14 }}>{c.item}</Text>}
                onPress={() => this.props.applyFilter(c.item)}
            />
            <Divider />
        </React.Fragment>
    )

    _keyExtractor = (item: string) => item;

    render() {
        if (this.props.history == null || this.props.history.length === 0) return null;

        return (
            <List.Section title={I18N.Screen_Search.history} style={{ marginBottom: isIphoneX() ? 48 : 32 }}>
                <Divider />
                {this.props.history.map((item) => this._renderSearchHistoryItem({ item }))}
            </List.Section>
        );
    }
}

export const SearchHistory = connect(
    (state: IAppState) => ({
        history: state.searchHistory.structure,
    }), {
})(
    withTheme(SearchHistoryBase),
);
