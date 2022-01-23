import React from 'react';
import { Query } from 'react-apollo';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Caption, List, Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { Circle } from '../../components/Placeholder/Circle';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { TextImageAvatar } from '../../components/TextImageAvatar';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { createApolloContext } from '../../helper/createApolloContext';
import { I18N } from '../../i18n/translation';
import { Assocations } from '../../model/graphql/Assocations';
import { IAppState } from '../../model/IAppState';
import { GetAssociationsQuery } from '../../queries/Structure/GetAssociationsQuery';
import { showAssociation } from '../../redux/actions/navigation';

type OwnProps = {
    navigation: any,
    theme: Theme,
    expanded?: boolean,
};

type StateProps = {
    expanded: boolean,
};

type DispatchPros = {
    showAssociation: typeof showAssociation;
    fetchPolicy: any,
};

type Props = OwnProps & StateProps & DispatchPros;

const ITEM_WIDTH = 64;
const ITEM_PADDING = 16;
const NUM_ELEMENTS = 3;

class AssociationsListBase extends React.Component<Props> {
    state = {
        expanded: this.props.expanded,
    };

    _toggle = () => {
        this.setState({ expanded: !this.state.expanded });
    }

    render() {
        return (
            <>
                <View
                    style={styles.container}
                >
                    <List.Subheader>{I18N.Screen_Structure.myassociations}</List.Subheader>
                    <TouchableRipple onPress={this._toggle}>
                        <Caption style={{ color: this.props.theme.colors.accent }}>{this.state.expanded ? I18N.Screen_Search.collapse : I18N.Screen_Search.expand}</Caption>
                    </TouchableRipple>
                </View>
                <ScrollView
                    horizontal={!this.state.expanded}
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                    bounces={!this.state.expanded}
                    nestedScrollEnabled={true}
                >
                    <View
                        style={{
                            backgroundColor: this.props.theme.colors.background,
                            justifyContent: this.state.expanded ? 'space-between' : undefined,
                            flexWrap: 'wrap',
                            flexDirection: this.state.expanded ? 'row' : 'column',
                            height: !this.state.expanded ? ITEM_WIDTH * NUM_ELEMENTS + ITEM_PADDING * NUM_ELEMENTS : undefined,
                            marginLeft: -ITEM_PADDING / 2,
                            marginRight: this.state.expanded ? ITEM_PADDING / 2 : undefined,
                        }}
                    >
                        <Query<Assocations>
                            query={GetAssociationsQuery}
                            fetchPolicy={this.props.fetchPolicy}
                            context={createApolloContext('AssociationsListBase')}
                        >
                            {({ data, loading }) => {
                                return (
                                    <Placeholder
                                        ready={!loading && data?.Associations != null}
                                        previewComponent={
                                            Array
                                                .apply(null, { length: 20 } as unknown as [])
                                                .map(Number.call, Number)
                                                .map((i: any) => (
                                                    <Circle
                                                        size={ITEM_WIDTH}
                                                        style={{ margin: ITEM_PADDING / 2 }}
                                                        key={i.toString()}
                                                    />
                                                ))
                                        }
                                    >
                                        {data?.Associations?.map((r) => (
                                            <TouchableRipple
                                                key={r.id}
                                                onPress={() => requestAnimationFrame(() => this.props.showAssociation(r.id, r.name))}
                                            >
                                                <View
                                                    style={{
                                                        alignItems: 'center',
                                                        alignContent: 'center',
                                                        marginHorizontal: ITEM_PADDING / 2,
                                                        marginVertical: ITEM_PADDING / 2,
                                                        width: ITEM_WIDTH,
                                                        height: ITEM_WIDTH,
                                                    }}
                                                >
                                                    <TextImageAvatar
                                                        label={r.id.replace(/rti_/ig, '').toUpperCase()}
                                                        source={r.flag}
                                                        size={48}
                                                    />
                                                    <Caption numberOfLines={1}>{r.name.replace(/^(41|RT|LC)\s/ig, '').trim()}</Caption>
                                                </View>
                                            </TouchableRipple>
                                        ))}
                                    </Placeholder>
                                );
                            }}
                        </Query>
                    </View>
                </ScrollView>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingRight: 24,
    },

    scrollView: {
        marginLeft: 16,
    },
});

export const AssociationsList = connect(
    (state: IAppState) => ({
        lru: state.searchHistory.lru,
    }),
    { showAssociation },
)(
    withCacheInvalidation(
        'associations',
        withNavigation(
            withTheme(AssociationsListBase))));
