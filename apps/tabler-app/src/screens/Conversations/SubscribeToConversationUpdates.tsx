import React from 'react';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { HandleAppState } from '../../components/HandleAppState';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { Categories, Logger } from '../../helper/Logger';
import { Features, isFeatureEnabled } from '../../model/Features';
import { conversationUpdate } from '../../model/graphql/conversationUpdate';
import { GetConversations } from '../../model/graphql/GetConversations';
import { IAppState } from '../../model/IAppState';
import { conversationUpdateSubscription } from '../../queries/Conversations/conversationUpdateSubscription';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { setBadge } from '../../redux/actions/chat';
import { Notifications } from 'expo';

const logger = new Logger(Categories.Helpers.Chat);

type Props = {
    chatEnabled?: boolean,
    websocket?: boolean,
    setBadge: typeof setBadge;
};

class SubscribeToConversationUpdatesBase extends React.PureComponent<Props> {
    subscription!: ZenObservable.Subscription | null;

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

                let conversations = client.readQuery<GetConversations>({
                    query: GetConversationsQuery,
                });

                if (conversations == null) {
                    const temp = await client.query<GetConversations>({
                        query: GetConversationsQuery,
                    });

                    conversations = temp.data;
                }

                logger.debug('Marking conversation', data.conversationUpdate.id, 'unread!');

                this.props.setBadge(1);
                await Notifications.setBadgeNumberAsync(1);

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
            (e) => { logger.error(e, 'Failed to subscribe to conversationUpdate'); },
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
        }),
        {
            setBadge
        },
    )(SubscribeToConversationUpdatesBase);
