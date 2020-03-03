import { uniqBy } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Platform, StyleSheet } from 'react-native';
import { Appbar, Divider, Theme, withTheme } from 'react-native-paper';
import { FlatList, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { ChatDisabledBanner } from '../../components/ChatDisabledBanner';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { ITEM_HEIGHT } from '../../components/Member/Dimensions';
import { EmptyComponent } from '../../components/NoResults';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { RefreshTracker } from '../../components/RefreshTracker';
import { TapOnNavigationParams } from '../../components/ReloadNavigationOptions';
import { ScreenWithHeader } from '../../components/Screen';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { GetConversations, GetConversationsVariables, GetConversations_Conversations_nodes } from '../../model/graphql/GetConversations';
import { IAppState } from '../../model/IAppState';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { searchConversationPartner, showConversation } from '../../redux/actions/navigation';
import { BOTTOM_HEIGHT } from '../../theme/dimensions';
import { WaitingForNetwork } from '../Conversation/WaitingForNetwork';
import { updateBadgeFromConversations } from './chatHelpers';
import { ConversationListItem } from './ConversationListItem';
import { MemberListPlaceholder } from './MemberListPlaceholder';
import { Ionicons } from '@expo/vector-icons';
import { QueryFailedError } from '../../helper/QueryFailedError';
import { createApolloContext } from '../../helper/createApolloContext';

const logger = new Logger(Categories.UIComponents.Chat);

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    chatEnabled: boolean,
    websocket: boolean,
};

type DispatchPros = {
    startConversation: typeof searchConversationPartner,
    showConversation: typeof showConversation,
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<TapOnNavigationParams>;

// tslint:disable-next-line: export-name
export class ConversationsScreenBase extends AuditedScreen<Props, State> {
    _flatList!: FlatList<any> | null;
    refetch!: () => any;

    constructor(props) {
        super(props, AuditScreenName.Conversations);
    }

    componentDidUpdate(prev) {
        if (prev.websocket !== this.props.websocket && this.props.websocket) {
            this._refresh();
        }
    }

    componentDidMount() {
        super.componentDidMount();

        this.props.navigation.setParams({
            tapOnTabNavigator: () => {
                requestAnimationFrame(
                    () => this._flatList?.scrollToOffset({
                        offset: 0, animated: true,
                    }),
                );
            },
        });
    }

    _renderItem = ({ item: l }): React.ReactElement | null => {
        return (
            <>
                <ConversationListItem conversation={l} />
                <Divider inset={true} />
            </>
        );
    }

    _extractKey = (item: GetConversations_Conversations_nodes) => item.id;

    _getItemLayout = (_data, index) => {
        return {
            index,
            length: ITEM_HEIGHT + StyleSheet.hairlineWidth,
            offset: (ITEM_HEIGHT + StyleSheet.hairlineWidth) * index,
        };
    }

    _refresh = async () => {
        logger.debug('refresh');
        // need to include network in the check
        if (this.refetch && this.props.websocket) {
            await this.refetch();
            logger.debug('refresh end');
        }

        // need to wait a bit for data to be available in cache?
        setTimeout(() => { try { updateBadgeFromConversations(); } catch { } }, 500);
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        return (
            <ScreenWithHeader
                header={{
                    showBack: false,
                    content: [
                        this.props.websocket
                            ? (
                                <Appbar.Content
                                    key="cnt"
                                    titleStyle={{ fontFamily: this.props.theme.fonts.medium }}
                                    title={I18N.Screen_Conversations.title}
                                />
                            )
                            : <WaitingForNetwork key="network" />
                        ,
                        (
                            <Appbar.Action
                                key="new"
                                icon={({ color, size }) => <Ionicons size={size} color={color} name="md-create" />}
                                disabled={!this.props.chatEnabled}
                                onPress={() => this.props.startConversation()}
                            />
                        ),
                    ],
                }}
            >
                <ChatDisabledBanner />

                <RefreshTracker>
                    {({ isRefreshing, createRunRefresh }) => {
                        return (
                            <Query<GetConversations, GetConversationsVariables>
                                query={GetConversationsQuery}
                                fetchPolicy="cache-and-network"
                                context={createApolloContext('ConversationsScreenBase')}
                            >
                                {({ data, error, loading, refetch, fetchMore }) => {
                                    this.refetch = createRunRefresh(refetch);
                                    if (error && !data) throw new QueryFailedError(error);

                                    return (
                                        <Placeholder
                                            ready={data != null}
                                            previewComponent={<MemberListPlaceholder />}
                                        >
                                            <FlatList
                                                ref={(r) => this._flatList = r}

                                                scrollEventThrottle={16}
                                                removeClippedSubviews={Platform.OS !== 'ios'}
                                                contentContainerStyle={styles.container}

                                                keyExtractor={this._extractKey}
                                                renderItem={this._renderItem}
                                                getItemLayout={this._getItemLayout}

                                                ListEmptyComponent={loading ? undefined : <EmptyComponent title={I18N.Screen_Members.noresults} />}

                                                data={data && data.Conversations ? data.Conversations.nodes : []}

                                                refreshing={loading || isRefreshing}
                                                onRefresh={this._refresh}

                                                onEndReached={() => {
                                                    if (!data || !data.Conversations.nextToken) { return; }

                                                    fetchMore({
                                                        variables: {
                                                            token: data.Conversations.nextToken,
                                                        },

                                                        updateQuery: (previousResult, { fetchMoreResult }) => {
                                                            // Don't do anything if there weren't any new items
                                                            if (!fetchMoreResult || fetchMoreResult.Conversations.nodes.length === 0) {

                                                                logger.log('no new data');
                                                                return previousResult;
                                                            }

                                                            logger.log('appending', fetchMoreResult.Conversations.nodes.length);

                                                            return {
                                                                // There are bugs that the calls are excuted twice
                                                                // a lot of notes on the internet
                                                                Conversations: {
                                                                    ...fetchMoreResult.Conversations,
                                                                    nodes: uniqBy(
                                                                        [...previousResult.Conversations.nodes, ...fetchMoreResult.Conversations.nodes],
                                                                        (f) => f.id,
                                                                    ),
                                                                },
                                                            };
                                                        },
                                                    });
                                                }}
                                                onEndReachedThreshold={0.5}
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

export const ConversationsScreen =
    withWhoopsErrorBoundary(
        withTheme(connect(
            (state: IAppState) => ({
                chatEnabled: state.settings.notificationsOneToOneChat || state.settings.notificationsOneToOneChat == null,
                websocket: state.connection.websocket,
            }),
            {
                showConversation,
                startConversation: searchConversationPartner,
            })(ConversationsScreenBase),
        ),
    );

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingBottom: BOTTOM_HEIGHT,
    },

    content: {
        padding: 0,
    },
});
