import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, ListRenderItemInfo, ScrollView, StyleSheet, View } from "react-native";
import { Checkbox, Divider, List, Text, Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { Audit } from "../../analytics/Audit";
import { IAuditor } from '../../analytics/Types';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { StandardHeader } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { IAppState } from '../../model/IAppState';
import { HashMap } from '../../model/Maps';
import { toggleAll, toggleDistrict, toggleFavorites, toggleOwnTable } from '../../redux/actions/filter';
import { HeaderStyles } from '../../theme/dimensions';
import { AreasQuery } from './Queries';

type State = {
};

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

const Element = ({ theme, title, onPress, right }: {
    theme, title, onPress, right?
}) => (
        <TouchableRipple
            style={{ backgroundColor: theme.colors.surface }}
            onPress={() => requestAnimationFrame(() => onPress())}
        >
            <View style={[styles.row]} pointerEvents="none">
                <Text>{title}</Text>
                {right}
            </View>
        </TouchableRipple>
    );


export class FilterScreenBase extends React.Component<Props, State> {
    audit: IAuditor;

    state = {
    };

    constructor(props) {
        super(props);
        this.audit = Audit.screen("Contacts");
    }

    componentDidMount() {
        this.audit.submit();
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

                    <Query query={AreasQuery} fetchPolicy={this.props.fetchPolicy}>
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

const styles = StyleSheet.create({
    first: {
        marginTop: 16,
    },

    section: {
        marginBottom: 16,
    },

    title: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },

    row: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingVertical: 8,
        paddingLeft: 16,
        paddingRight: 8,
        height: 50,
    },
});


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
    })(withTheme(
        withWhoopsErrorBoundary(
            withCacheInvalidation("areas", FilterScreenBase))
    ));
