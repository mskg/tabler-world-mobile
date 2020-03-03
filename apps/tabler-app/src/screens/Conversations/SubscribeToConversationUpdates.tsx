import React from 'react';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { HandleAppState } from '../../components/HandleAppState';
import { setBadgeNumber } from '../../helper/bagde';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { Categories, Logger } from '../../helper/Logger';
import { Features, isFeatureEnabled } from '../../model/Features';
import { Conversation, ConversationVariables } from '../../model/graphql/Conversation';
import { conversationUpdate } from '../../model/graphql/conversationUpdate';
import { GetConversations } from '../../model/graphql/GetConversations';
import { IAppState } from '../../model/IAppState';
import { conversationUpdateSubscription } from '../../queries/Conversations/conversationUpdateSubscription';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { setBadge } from '../../redux/actions/chat';
import { checkBadge } from '../../sagas/chat/checkBadge';
import { createApolloContext } from '../../helper/createApolloContext';

const logger = new Logger(Categories.Helpers.Chat);

type Props = {
    chatEnabled?: boolean,
    websocket?: boolean,
    setBadge: typeof setBadge;
    badge: number,
    activeConversation: string | null,
};

class SubscribeToConversationUpdatesBase extends React.PureComponent<Props> {
    subscription!: ZenObservable.Subscription | null;

    componentDidMount() {
        checkBadge();
    }

    componentDidUpdate(prev) {
        if (prev.websocket !== this.props.websocket && this.props.websocket && this.props.chatEnabled) {
            this._subscribe();
        } else if (prev.chatEnabled !== this.props.chatEnabled && this.props.chatEnabled && this.props.websocket) {
            this._subscribe();
        }
    }

    _unsubscribe = () => {
        logger.debug('Stop watching channel udpates');

        if (this.subscription) {
            logger.debug('unsubscribe');
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    _subscribe = async () => {
        if (this.subscription) { return; }

        if (!this.props.chatEnabled || !this.props.websocket) {
            logger.debug('No chat or no websocket');
            return;
        }

        if (!isFeatureEnabled(Features.Chat) || (await isDemoModeEnabled())) {
            logger.debug('Feature not enabled');
            return;
        }

        logger.debug('Starting watching channel udpates');

        const client = cachedAolloClient();
        const query = client.subscribe<conversationUpdate>({
            query: conversationUpdateSubscription,
        });

        this.subscription = query.subscribe(
            async (nextVal) => {
                if (__DEV__) { logger.debug('Received', nextVal); }
                const data = nextVal.data as conversationUpdate;

                let conversations;

                try {
                    conversations = client.readQuery<GetConversations>({
                        query: GetConversationsQuery,
                    });
                } catch (e) {
                    logger.log('Failed to read conversations', e);
                }

                if (conversations == null) {
                    const temp = await client.query<GetConversations>({
                        query: GetConversationsQuery,
                        fetchPolicy: 'network-only',
                        context: createApolloContext('chat-conversations-conversations'),
                    });

                    conversations = temp.data;
                }

                logger.debug('Marking conversation', data.conversationUpdate.id, 'unread!');

                // it was not send by us or we are not up to date
                if (data.conversationUpdate.hasUnreadMessages) {
                    if (this.props.badge === 0) {
                        logger.debug('Updating badge');

                        this.props.setBadge(1);
                        setBadgeNumber(1);
                    }

                    // we update our local data
                    if (this.props.activeConversation !== data.conversationUpdate.id) {
                        logger.debug('Updating local data');

                        setTimeout(async () => {
                            try {
                                // need to update cache this way
                                await client.query<Conversation, ConversationVariables>({
                                    query: GetConversationQuery,
                                    variables: {
                                        id: data.conversationUpdate.id,
                                        dontMarkAsRead: true,
                                    },
                                    fetchPolicy: 'network-only',
                                    context: createApolloContext('chat-conversations-active'),
                                });
                            } catch (e) {
                                logger.log('Failed to refresh data.', e);
                            }
                        });
                    }
                }

                // still we move it on top
                const nodes = conversations ? conversations.Conversations.nodes : [];
                client.writeQuery<GetConversations>({
                    query: GetConversationsQuery,
                    data: {
                        ...conversations,
                        Conversations: {
                            ...conversations.Conversations,
                            nodes: [
                                data.conversationUpdate,
                                ...nodes.filter((c) => c.id !== data.conversationUpdate.id),
                            ],
                        },
                    },
                });
            },
            (e) => { logger.error('chat-conversations-subscribe', e); },
        );

        logger.debug('> subscribed');
    }

    render() {
        return (
            <HandleAppState
                triggerOnFirstMount={true}
                triggerOnUnmount={true}
                onActive={this._subscribe}
                onInactive={this._unsubscribe}
            />
        );
    }
}

export const SubscribeToConversationUpdates =
    connect(
        (state: IAppState) => ({
            websocket: state.connection.websocket,
            chatEnabled: state.settings.notificationsOneToOneChat == null
                ? true
                : state.settings.notificationsOneToOneChat,
            badge: state.chat.badge,
            activeConversation: state.chat.activeConversation,
        }),
        {
            setBadge,
        },
    )(SubscribeToConversationUpdatesBase);
