import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Caption, Card, Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { Accordion } from '../../components/Accordion';
import { RoleAvatarGrid } from '../../components/Club/RoleAvatarGrid';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { CachedImage } from '../../components/Image/CachedImage';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { RefreshTracker } from '../../components/RefreshTracker';
import { ScreenWithHeader } from '../../components/Screen';
import { TextImageAvatar } from '../../components/TextImageAvatar';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { createApolloContext } from '../../helper/createApolloContext';
import { QueryFailedError } from '../../helper/QueryFailedError';
import { I18N } from '../../i18n/translation';
import { Families, Families_Families } from '../../model/graphql/Families';
import { IAppState } from '../../model/IAppState';
import { GetFamiliesQuery } from '../../queries/Structure/GetFamiliesQuery';
import { showAssociation } from '../../redux/actions/navigation';
import { CardPlaceholder } from '../Structure/CardPlaceholder';
import { styles } from './styles';

type State = {
};

type OwnProps = {
    theme: Theme,
    offline: boolean,
    fetchPolicy: any,
};

type StateProps = {
};

type DispatchPros = {
    showAssociation: typeof showAssociation;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<{ family: string }>;

const ITEM_WIDTH = 64;
const ITEM_PADDING = 16;
const NUM_ELEMENTS = 3;

class FamiliesScreenBase extends AuditedScreen<Props, State> {
    flatList!: FlatList<Families_Families> | null;

    state: State = {
    };

    constructor(props) {
        super(props, AuditScreenName.Families);
    }

    _renderItem = ({ item, index }: { item: Families_Families, index: number }) => {
        return (
            <Card key={item.id} style={styles.card}>

                <Card.Title
                    title={item.name}
                />

                {item.logo && (
                    <View style={[styles.imageContainer, { backgroundColor: this.props.theme.colors.surface }]}>
                        <CachedImage
                            style={styles.image}
                            uri={item.logo}
                            cacheGroup="family"
                        />
                    </View>
                )}

                {item.board.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.board} expanded={false}>
                        <RoleAvatarGrid roles={item.board} items={3} />
                    </Accordion>
                )}

                {item.boardassistants.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.assist} expanded={false}>
                        <RoleAvatarGrid roles={item.boardassistants} items={3} />
                    </Accordion>
                )}

                {item.regionalboard.length > 0 && (
                    <Accordion style={styles.accordeon} title={I18N.Screen_Structure.regionalboard} expanded={false}>
                        <RoleAvatarGrid roles={item.regionalboard} items={3} />
                    </Accordion>
                )}

                <Accordion
                    style={styles.accordeon} title={I18N.Screen_Families.associations}
                // expanded={item.id === this.props.navigation.getParam('family')}
                >
                    <Card.Content
                        style={{
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            flexDirection: 'row',
                            marginLeft: -ITEM_PADDING / 2,
                            marginRight: ITEM_PADDING / 2,
                        }}
                    >
                        {item?.associations?.map((r) => (
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
                    </Card.Content>
                </Accordion>

                <View style={styles.bottom} />
            </Card>
        );
    }

    _key = (item: Families_Families, _index: number) => {
        return item.id;
    }

    render() {
        return (
            <ScreenWithHeader header={{ showBack: true, title: I18N.Screen_Families.title }}>
                <RefreshTracker>
                    {({ isRefreshing, createRunRefresh }) => {
                        return (
                            <Query<Families>
                                query={GetFamiliesQuery}
                                fetchPolicy={this.props.fetchPolicy}
                                context={createApolloContext('FamiliesScreenBase')}
                            >
                                {({ loading, error, data, refetch }) => {
                                    if (error) throw new QueryFailedError(error);

                                    if (!loading && (data == null || data.Families == null)) {
                                        if (this.props.offline) {
                                            return <CannotLoadWhileOffline />;
                                        }

                                        setTimeout(createRunRefresh(refetch));
                                    }

                                    const orderBy = this.props.navigation.getParam('family') || data?.Me.family.id;

                                    return (
                                        <Placeholder
                                            ready={data != null && data.Families != null}
                                            previewComponent={<CardPlaceholder />}
                                        >
                                            <FlatList
                                                ref={(r) => this.flatList = r}
                                                contentContainerStyle={styles.container}
                                                data={
                                                    _(data?.Families || [])
                                                        .orderBy((a) => orderBy === a.id ? '0' : a.name)
                                                        .toArray()
                                                        .value()
                                                }

                                                refreshing={isRefreshing || loading}
                                                onRefresh={createRunRefresh(refetch)}

                                                renderItem={this._renderItem}
                                                keyExtractor={this._key}
                                            />
                                        </Placeholder>
                                    );
                                }}
                            </Query>
                        );
                    }}
                </RefreshTracker>

            </ScreenWithHeader>
        );
    }
}

// tslint:disable-next-line: export-name
export const FamiliesScreen = connect(
    (state: IAppState) => ({
        offline: state.connection.offline,
    }),
    {
        showAssociation,
    },
)(
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'families',
            withTheme(
                FamiliesScreenBase),
        ),
    ),
);;
