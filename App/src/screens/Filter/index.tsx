import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, ListRenderItemInfo, ScrollView, View } from "react-native";
import { Checkbox, Divider, List, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { StandardHeader } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { AreasFilter } from '../../model/graphql/AreasFilter';
import { IAppState } from '../../model/IAppState';
import { HashMap } from '../../model/Maps';
import { GetAreasFilterQuery } from '../../queries/GetAreasFilterQuery';
import { toggleAll, toggleDistrict, toggleFavorites, toggleOwnTable } from '../../redux/actions/filter';
import { HeaderStyles } from '../../theme/dimensions';
import { Element } from './Element';

type OwnProps = {
};

type StateProps = {
    filter: HashMap<boolean, string>,
    theme: Theme,
    showFavorites: boolean,
    showOwntable: boolean,
};

type DispatchPros = {
    toggleDistrict: typeof toggleDistrict;
    toggleAll: typeof toggleAll;
    toggleFavorites: typeof toggleFavorites;
    toggleOwnTable: typeof toggleOwnTable;
    fetchPolicy: any,
};

type Props = OwnProps & StateProps & DispatchPros;

class FilterScreenBase extends AuditedScreen<Props> {
    constructor(props) {
        super(props, AuditScreenName.FilterMember);
    }

    _renderItem = (c: ListRenderItemInfo<any>) => {
        const { name } = c.item;

        return (
            <>
                <Element
                    title={name}
                    theme={this.props.theme}
                    onPress={() => this.props.toggleDistrict(name)}
                    right={
                        <Checkbox
                            color={this.props.theme.colors.accent}
                            status={
                                this.props.filter == null
                                    || this.props.filter[name] === true ? 'checked' : 'unchecked'
                            }
                            onPress={() => { this.props.toggleDistrict(name); }}
                        />
                    } />
                <Divider />
            </>
        );
    }

    _keyExtractor = (item: any) => item.id;

    render() {
        return (
            <Screen>
                <ScrollView>
                    <View style={{ paddingTop: 16 }} />
                    <Element
                        theme={this.props.theme}
                        title={
                            <Text style={{ color: this.props.theme.colors.accent }}>{
                                this.props.filter == null ? I18N.Filter.hideAll : I18N.Filter.showAll
                            }</Text>
                        }
                        onPress={() => this.props.toggleAll()}
                    />

                    <List.Section title={I18N.Filter.favorites}>
                        <Element
                            title={I18N.Filter.toggleOwnTable}
                            theme={this.props.theme}
                            onPress={() => this.props.toggleOwnTable()}
                            right={
                                <Checkbox
                                    color={this.props.theme.colors.accent}
                                    status={this.props.showOwntable ? 'checked' : 'unchecked'}
                                    onPress={() => { this.props.toggleOwnTable(); }}
                                />
                            }
                        />
                        <Divider />
                        <Element
                            title={I18N.Filter.toggleFavorits}
                            theme={this.props.theme}
                            onPress={() => this.props.toggleFavorites()}
                            right={
                                <Checkbox
                                    color={this.props.theme.colors.accent}
                                    status={this.props.showFavorites ? 'checked' : 'unchecked'}
                                    onPress={() => { this.props.toggleFavorites(); }}
                                />
                            }
                        />
                    </List.Section>

                    <Query<AreasFilter> query={GetAreasFilterQuery} fetchPolicy={this.props.fetchPolicy}>
                        {({ loading, data, error, refetch }) => {
                            if (loading || error) return null;

                            // we ignore the errors here for now
                            return (<List.Section title={I18N.Filter.area}>
                                <FlatList
                                    data={data ? (data.Areas || []) : []}
                                    extraData={this.props.filter}
                                    renderItem={this._renderItem}
                                    keyExtractor={this._keyExtractor}
                                    refreshing={loading}
                                    onRefresh={refetch}
                                    bounces={false}
                                />
                            </List.Section>);
                        }}
                    </Query>
                </ScrollView>

                <StandardHeader
                    style={[HeaderStyles.topBar]}
                    showBack={true}
                    title={I18N.Filter.title}
                />
            </Screen>
        );
    }
}

export const FilterScreen = connect(
    (state: IAppState) => ({
        filter: state.filter.member.area,
        showFavorites: state.filter.member.showFavorites,
        showOwntable: state.filter.member.showOwntable,
    }), {
        toggleAll,
        toggleFavorites,
        toggleDistrict,
        toggleOwnTable,
    })(
        withWhoopsErrorBoundary(
            withCacheInvalidation("areas", withTheme(FilterScreenBase)))
    );