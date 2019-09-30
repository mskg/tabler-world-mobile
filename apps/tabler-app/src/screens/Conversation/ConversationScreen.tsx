import { DataProxy } from 'apollo-cache';
import { reverse, sortBy, uniqBy } from 'lodash';
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
import { newChatMessage, newChatMessageVariables } from '../../model/graphql/newChatMessage';
import { SendMessage, SendMessageVariables } from '../../model/graphql/sendMessage';
import { IConversationParams } from '../../redux/actions/navigation';
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

const PENDING = '_pending';
const FAILED = '_failed';

// tslint:disable: max-func-body-length
class ConversationScreenBase extends AuditedScreen<Props & NavigationInjectedProps<IConversationParams>, State> {
    ref: any;

    constructor(props) {
        super(props, AuditScreenName.Conversation);

        this.state = { loadingEarlier: false, eof: false };
    }

    _addMessage = (cache: DataProxy, { data: { sendMessage } }: any) => {
        // we always add to the end
        const variables = {
            token: undefined,
            id: this.getConversationId(),
        };

        // Read the data from our cache for this query.
        const data = cache.readQuery<Conversation, ConversationVariables>({
            query: GetConversationQuery,
            variables,
        });

        if (data == null) {
            return;
        }

        const newArray = this.merge(
            [sendMessage],
            // we don't add the message if it is already there
            data.Conversation!.messages.nodes,
            true,
        );

        if (newArray !== data.Conversation!.messages.nodes) {
            // cache has change detection, we only modify what we need
            data.Conversation!.messages.nodes = newArray;

            cache.writeQuery({
                query: GetConversationQuery,
                data,
                variables,
            });
        } else {
            logger.log('Skipping update');
        }
    }

    _sendMessage = (messages: IChatMessage[]) => {
        const client = cachedAolloClient();

        const optimisticMessage = {
            __typename: 'ChatMessage',
            eventId: PENDING,
            id: messages[0]._id,
            receivedAt: messages[0].createdAt || new Date(),
            senderId: messages[0].user._id,
            payload: messages[0].text,
            delivered: false,
            accepted: false,
        };

        requestAnimationFrame(async () => {
            // we don't use the optimistic UI here
            // because we want to keep the message if it fails
            this._addMessage(client, {
                data: {
                    sendMessage: optimisticMessage,
                },
            });

            this.setState({ redraw: {} });

            requestAnimationFrame(async () => {
                try {
                    await client.mutate<SendMessage, SendMessageVariables>({
                        mutation: SendMessageMutation,
                        variables: {
                            id: optimisticMessage.id,
                            message: optimisticMessage.payload,
                            conversation: this.getConversationId(),
                        },

                        update: this._addMessage,
                    });
                } catch (e) {
                    logger.error(e, 'Failed to send message');

                    // we don't use the optimistic UI here
                    // because we want to keep the message if it fails
                    this._addMessage(client, {
                        data: {
                            sendMessage: {
                                ...optimisticMessage,
                                eventId: FAILED,
                            },
                        },
                    });
                }

                this.setState({ redraw: {} });
            });
        });
    }

    merge<T extends { eventId: string, id: string }>(items: T[], list: T[], skipAdd = false): T[] {
        if (skipAdd) {
            const element = (list || []).find(
                (f) => f.id === items[0].id
                    && f.eventId !== FAILED
                    && f.eventId !== PENDING,
            );

            if (element != null) {
                logger.debug('skipping add', element);
                return list;
            }
        }

        logger.debug('merging', items);

        return reverse(
            sortBy(
                // unique keeps the first occurence
                uniqBy(
                    [
                        ...(items || []),
                        ...(list || []),
                    ],
                    (i) => i.id,
                ),
                // allows sorting
                (i) => i.eventId,
            ),
        );
    }

    getConversationId() {
        return (this.props.navigation.state.params as IConversationParams).id as string;
    }

    getTitle() {
        return (this.props.navigation.state.params as IConversationParams).title as string;
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    title: this.getTitle(),
                    showBack: true,
                }}
            >
                {/* <View style={[styles.container, { backgroundColor: this.props.theme.colors.surface }]}> */}
                <Query<Conversation, ConversationVariables>
                    query={GetConversationQuery}
                    variables={{
                        id: this.getConversationId(),
                        token: undefined,
                    }}
                    fetchPolicy="network-only"
                >
                    {({ loading, data, fetchMore /*error, refetch*/, subscribeToMore }) => {
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
                                    () => subscribeToMore<newChatMessage, newChatMessageVariables>({
                                        document: newChatMessageSubscription,
                                        variables: {
                                            conversation: this.getConversationId(),
                                        },
                                        updateQuery: (prev, { subscriptionData }) => {
                                            if (!subscriptionData.data || !subscriptionData.data.newChatMessage) { return prev; }

                                            const newFeedItem = subscriptionData.data.newChatMessage;
                                            logger.debug('received', newFeedItem);

                                            requestAnimationFrame(() => this.setState({ redraw: {} }));
                                            return {
                                                Conversation: {
                                                    ...prev.Conversation,
                                                    messages: {
                                                        ...prev.Conversation!.messages,
                                                        nodes: this.merge([newFeedItem], prev.Conversation!.messages.nodes),
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
                                                id: this.getConversationId(),
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

                                                requestAnimationFrame(() => this.setState({ loadingEarlier: false, eof: false, redraw: {} }));
                                                return {
                                                    // There are bugs that the calls are excuted twice
                                                    // a lot of notes on the internet
                                                    Conversation: {
                                                        ...fetchMoreResult.Conversation,
                                                        messages: {
                                                            ...fetchMoreResult.Conversation.messages,
                                                            nodes: this.merge(prev.Conversation!.messages.nodes, fetchMoreResult.Conversation.messages.nodes),
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
                                        createdAt: m.eventId === FAILED ? undefined : new Date(m.receivedAt),

                                        user: {
                                            _id: m.senderId,
                                        },

                                        text: m.payload,

                                        sent: m.accepted ? true : false,
                                        received: m.delivered ? true : false,
                                        pending: !m.accepted,

                                        failedSend: m.eventId === FAILED ? true : false,
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
