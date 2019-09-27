import { uuid4 } from '@sentry/utils';
import { DataProxy } from 'apollo-cache';
import ApolloClient from 'apollo-client';
import _, { filter, sortBy, uniqBy } from 'lodash';
import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Query } from 'react-apollo';
import { IMessage } from 'react-native-gifted-chat';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
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

    _update = (client: DataProxy, { data: { sendMessage } }: any) => {
        logger.debug('******* Update', sendMessage);

        // Read the data from our cache for this query.
        const data = client.readQuery<Conversation, ConversationVariables>({
            query: GetConversationQuery,
            variables: {
                token: undefined,
            },
        });

        if (data == null) {
            return;
        }

        data.Conversation!.messages.nodes = sortBy(
            uniqBy(
                [
                    sendMessage,
                    ...filter(
                        data.Conversation!.messages.nodes,
                        (f) => f.id !== sendMessage.id,
                    ),
                ],
                (s) => s!.id,
            ),
        );

        // tslint:disable-next-line: object-shorthand-properties-first
        client.writeQuery({
            query: GetConversationQuery,
            data: _.cloneDeep(data),
            variables: {
                token: undefined,
            },
        });
    }

    _sendMessage = (client: ApolloClient<any>) => async (messages: IMessage[]) => {
        const id = uuid4();

        this._update(
            client,
            {
                data: {
                    sendMessage: {
                        id,
                        __typename: 'ChatMessage',
                        receivedAt: new Date().toISOString(),
                        senderId: 10430,
                        payload: messages[0].text,
                        eventId: '_sent',
                        sent: false,
                    },
                },
            },
        );

        const result = await client.mutate<SendMessage, SendMessageVariables>({
            mutation: SendMessageMutation,
            variables: {
                id,
                message: messages[0].text,
            },
        });

        this._update(client, result);

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
                    fetchPolicy="cache-and-network"
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
                                    () => subscribeToMore<newChatMessage, any>({
                                        document: newChatMessageSubscription,
                                        updateQuery: (prev, { subscriptionData }) => {
                                            if (!subscriptionData.data) return prev;

                                            const newFeedItem = subscriptionData.data.newChatMessage;
                                            logger.debug('received', newFeedItem);

                                            return {
                                                ...prev,
                                                Conversation: {
                                                    ...prev.Conversation,
                                                    messages: {
                                                        ...prev.Conversation!.messages,
                                                        nodes: sortBy(
                                                            uniqBy(
                                                                [
                                                                    newFeedItem,
                                                                    ...prev.Conversation!.messages.nodes,
                                                                ],
                                                                (i) => i!.id,
                                                            ),
                                                            (s) => s!.eventId,
                                                        ),
                                                    },
                                                },
                                            } as Conversation;
                                        },
                                    })
                                }

                                sendMessage={this._sendMessage(client)}

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
                                        createdAt: new Date(m.receivedAt),
                                        user: {
                                            _id: m.senderId,
                                        },
                                        text: m.payload,

                                        pending: m.eventId === '_sent' ? true : false,
                                        sent: m.sent ? true : false,

                                        // pending: m.eventId === '_sent' ? true : undefined,
                                        // sent: m.eventId !== '_sent'
                                        //     ? m.sent ? true : false
                                        //     : undefined,
                                    }))
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
