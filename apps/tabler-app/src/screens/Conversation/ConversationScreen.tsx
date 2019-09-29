import { DataProxy } from 'apollo-cache';
import { filter, uniqBy } from 'lodash';
import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Query } from 'react-apollo';
import { IChatMessage } from 'react-native-gifted-chat';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { FullScreenLoading } from '../../components/Loading';
import { ScreenWithHeader } from '../../components/Screen';
import { Categories, Logger } from '../../helper/Logger';
import { Conversation, ConversationVariables, Conversation_Conversation_messages_nodes } from '../../model/graphql/Conversation';
import { newChatMessage } from '../../model/graphql/newChatMessage';
import { SendMessage, SendMessageVariables } from '../../model/graphql/sendMessage';
import { Chat } from './Chat';
import { GetConversationQuery } from './GetConversationQuery';
import { newChatMessageSubscription } from './newChatMessageSubscription';
import { SendMessageMutation } from './SendMessageMutation';

const logger = new Logger(Categories.Screens.Conversation);

type Props = {
    theme: Theme,
};

type State = {
    redraw?: any,
    loadingEarlier: boolean,
    eof: boolean,
};

// tslint:disable: max-func-body-length
class ConversationScreenBase extends AuditedScreen<Props & NavigationInjectedProps<any>, State> {
    ref: any;

    constructor(props) {
        super(props, AuditScreenName.Conversation);

        this.state = { loadingEarlier: false, eof: false };
    }

    _addMessage = (cache: DataProxy, { data: { sendMessage } }: any) => {
        logger.debug('******* Update', sendMessage);

        // we always add to the end
        const variables = {
            token: undefined,
        };

        // Read the data from our cache for this query.
        const data = cache.readQuery<Conversation, ConversationVariables>({
            query: GetConversationQuery,
            variables,
        });

        if (data == null) {
            return;
        }

        // cache has change detection, we only modify what we need
        data.Conversation!.messages.nodes = [
            sendMessage,
            ...filter(
                data.Conversation!.messages.nodes,
                (f) => f!.id !== sendMessage.id,
            ),
        ];

        cache.writeQuery({
            query: GetConversationQuery,
            data,
            variables,
        });
    }

    _sendMessage = async (messages: IChatMessage[]) => {
        const client = cachedAolloClient();

        const optimisticMessage = {
            __typename: 'ChatMessage',
            id: messages[0]._id,
            receivedAt: messages[0].createdAt || new Date(),
            senderId: messages[0].user._id,
            payload: messages[0].text,
            eventId: '_sent',
            sent: false,
        };

        try {
            // we don't use the optimistic UI here
            // because we want to keep the message if it fails
            this._addMessage(client, {
                data: {
                    sendMessage: optimisticMessage,
                },
            });

            await client.mutate<SendMessage, SendMessageVariables>({
                mutation: SendMessageMutation,
                variables: {
                    id: optimisticMessage.id,
                    message: optimisticMessage.payload,
                },

                update: this._addMessage,
            });
        } catch (e) {
            // we don't use the optimistic UI here
            // because we want to keep the message if it fails
            this._addMessage(client, {
                data: {
                    sendMessage: {
                        ...optimisticMessage,
                        eventId: '_failed',
                    },
                },
            });
        }

        this.setState({ redraw: {} });
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    title: 'Max und Moritz',
                    showBack: true,
                }}
            >
                {/* <View style={[styles.container, { backgroundColor: this.props.theme.colors.surface }]}> */}
                <Query<Conversation, ConversationVariables>
                    query={GetConversationQuery}
                    variables={{
                        token: undefined,
                    }}
                    fetchPolicy="cache-first"
                >
                    {({ client, loading, data, fetchMore /*error, refetch*/, subscribeToMore }) => {
                        if (loading && (!data || !data.Conversation)) {
                            return <FullScreenLoading />;
                        }

                        let messages;
                        if (data && data.Conversation && data.Conversation.messages) {
                            messages = data.Conversation.messages;
                        }

                        return (
                            <Chat
                                extraData={this.state.redraw}
                                subscribe={
                                    // we need to create a function that is executed once
                                    () => subscribeToMore<newChatMessage, any>({
                                        document: newChatMessageSubscription,
                                        updateQuery: (prev, { subscriptionData }) => {
                                            if (!subscriptionData.data) return prev;

                                            return prev;

                                            const newFeedItem = subscriptionData.data.newChatMessage;
                                            logger.debug('received', newFeedItem);

                                            return {
                                                ...prev,
                                                Conversation: {
                                                    ...prev.Conversation,
                                                    messages: {
                                                        ...prev.Conversation!.messages,
                                                        nodes:
                                                            uniqBy(
                                                                [
                                                                    newFeedItem,
                                                                    ...prev.Conversation!.messages.nodes,
                                                                ],
                                                                (i) => i!.id,
                                                            ),
                                                    },
                                                },
                                            } as Conversation;
                                        },
                                    })
                                }

                                sendMessage={this._sendMessage}

                                isLoadingEarlier={this.state.loadingEarlier}
                                loadEarlier={!this.state.eof}

                                onLoadEarlier={() => {
                                    this.setState({ loadingEarlier: true }, () => {
                                        if (messages && messages.nextToken == null) {
                                            setTimeout(() => this.setState({ loadingEarlier: false, eof: true, redraw: {} }));
                                            return;
                                        }

                                        fetchMore({
                                            variables: {
                                                token: messages.nextToken,
                                            },

                                            updateQuery: (previousResult, options) => {
                                                // TOOD: check why this is not typed
                                                const fetchMoreResult = options.fetchMoreResult as Conversation;
                                                const prev = previousResult as Conversation;

                                                // Don't do anything if there weren't any new items
                                                if (!fetchMoreResult || !fetchMoreResult.Conversation || fetchMoreResult.Conversation.messages.nodes.length === 0) {
                                                    logger.log('no new data');
                                                    setTimeout(() => this.setState({ loadingEarlier: false, eof: true, redraw: {} }));
                                                    return previousResult;
                                                }

                                                logger.log('appending', fetchMoreResult.Conversation.messages.nodes.length);

                                                setTimeout(() => this.setState({ loadingEarlier: false, eof: false, redraw: {} }));
                                                return {
                                                    // There are bugs that the calls are excuted twice
                                                    // a lot of notes on the internet
                                                    Conversation: {
                                                        ...fetchMoreResult.Conversation,
                                                        messages: {
                                                            ...fetchMoreResult.Conversation.messages,
                                                            nodes: uniqBy(
                                                                [
                                                                    ...prev.Conversation!.messages.nodes,
                                                                    ...fetchMoreResult.Conversation.messages.nodes,
                                                                ],
                                                                (f) => f.id,
                                                            ),
                                                        },
                                                    },
                                                };
                                            },
                                        });
                                    });
                                }}

                                messages={
                                    (messages || { nodes: [] }).nodes.map((m: Conversation_Conversation_messages_nodes) => ({
                                        _id: m.id,
                                        createdAt: m.eventId === '_failed' ? undefined : new Date(m.receivedAt),

                                        user: {
                                            _id: m.senderId,
                                        },

                                        text: m.payload,

                                        sent: m.sent ? true : false,
                                        pending: m.eventId === '_sent' ? true : false,
                                        failedSend: m.eventId === '_failed' ? true : false,
                                    } as IChatMessage))
                                }
                            />
                        );
                    }}
                </Query>
            </ScreenWithHeader >
        );
    }
}

export const ConversationScreen = withTheme(withNavigation(ConversationScreenBase));
