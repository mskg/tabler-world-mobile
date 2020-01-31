import { ApolloQueryResult, FetchMoreOptions, FetchMoreQueryOptions, SubscribeToMoreOptions } from 'apollo-client';
import { filter, remove, reverse, sortBy, uniqBy } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { FullScreenLoading } from '../../components/Loading';
import { Categories, Logger } from '../../helper/Logger';
import { Conversation, ConversationVariables, Conversation_Conversation_members, Conversation_Conversation_messages, Conversation_Conversation_messages_nodes } from '../../model/graphql/Conversation';
import { newChatMessage, newChatMessageVariables } from '../../model/graphql/newChatMessage';
import { IAppState } from '../../model/IAppState';
import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { newChatMessageSubscription } from '../../queries/Conversations/newChatMessageSubscription';
import { IConversationParams } from '../../redux/actions/navigation';
import { ChatMessageEventId } from '../../sagas/chat/ChatMessageEventId';
import { mergeMessages } from '../../sagas/chat/mergeMessages';
import { IChatMessage } from './IChatMessage';

const logger = new Logger(Categories.Screens.Conversation);

type InjectedProps = {
    extraData: any,
    userId: number,

    isLoadingEarlier: boolean,
    loadEarlier: boolean,
    onLoadEarlier: () => void,

    messages: IChatMessage[],
    subscribe: () => void,
};

type Props = {
    conversationId: string;

    websocket: boolean;
    pendingMessages: IPendingChatMessage[];

    children: React.ReactElement<InjectedProps>;

    partiesResolved: (member: Conversation_Conversation_members) => void;
};


type State = {
    loadingEarlier: boolean,
    eof: boolean,
    redraw?: any,
};

// tslint:disable: max-func-body-length
class ConversationQueryBase extends React.Component<Props & NavigationInjectedProps<IConversationParams>, State> {
    refetch!: any;
    unsubscribe!: () => void;

    constructor(props) {
        super(props);
        this.state = { loadingEarlier: false, eof: false };
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            logger.log('Unsubscribe');
            this.unsubscribe();
        }
    }

    componentDidUpdate(prev) {
        if (prev.websocket !== this.props.websocket && this.props.websocket) {
            if (this.refetch) {
                this.refetch();
            }
        }
    }

    _merge = (received: IChatMessage[], pending: IChatMessage[]) => {
        const thisConv = this.props.conversationId;

        remove(
            filter(received, (r) => r.channel === thisConv),
            (p) => received.find((r) => r._id === p._id) !== null,
        );

        return uniqBy(
            [
                ...reverse(sortBy(pending, (p) => p.createdAt)),
                ...received,
            ],
            (m) => m._id,
        );
    }

    _convertTransportMessage = (m: Conversation_Conversation_messages_nodes) => ({
        _id: m.id,
        createdAt: m.eventId === ChatMessageEventId.Failed ? undefined : new Date(m.receivedAt),

        user: {
            _id: m.senderId,
        },

        text: m.payload.text,
        image: m.payload.image,

        sent: m.accepted || m.delivered ? true : false,
        received: m.delivered ? true : false,
        pending: !(m.accepted || m.delivered),

        failedSend: m.eventId === ChatMessageEventId.Failed ? true : false,
    } as IChatMessage)

    _convertTemp = (m: IPendingChatMessage) => ({
        _id: m.id,
        createdAt: m.createdAt,
        channel: m.conversationId,

        user: {
            _id: m.sender,
        },

        text: m.text,
        image: m.image,

        sent: false,
        received: false,
        pending: true,

        failedSend: m.failed ? true : false,
    } as IChatMessage)

    _subscribeToMore = (subscribeToMore: (options: SubscribeToMoreOptions<Conversation, newChatMessageVariables, newChatMessage>) => () => void) => {
        return () => {
            this.unsubscribe = subscribeToMore({
                document: newChatMessageSubscription,
                variables: {
                    conversation: this.props.conversationId,
                },

                updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data || !subscriptionData.data.newChatMessage) { return prev; }

                    const newFeedItem = subscriptionData.data.newChatMessage;
                    logger.debug('received', newFeedItem);

                    requestAnimationFrame(() => this.setState({ redraw: {} }));
                    return {
                        ...prev,
                        Conversation: {
                            ...prev.Conversation,
                            messages: {
                                ...prev.Conversation!.messages,
                                nodes: mergeMessages([newFeedItem], prev.Conversation!.messages.nodes),
                            },
                        },
                    } as Conversation;
                },
            });
        };
    }

    _loadEarlier = (
        fetchMore: (fetchMoreOptions: FetchMoreQueryOptions<ConversationVariables, keyof ConversationVariables> & FetchMoreOptions<Conversation, ConversationVariables>) => Promise<ApolloQueryResult<Conversation>>,
        messages: Conversation_Conversation_messages,
    ) => {
        return () => this.setState({ loadingEarlier: true }, () => {
            if (messages && messages.nextToken == null) {
                requestAnimationFrame(() => this.setState({ loadingEarlier: false, eof: true, redraw: {} }));
                return;
            }

            fetchMore({
                variables: {
                    token: messages.nextToken,
                    id: this.props.conversationId,
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

                    // logger.log('appending', fetchMoreResult.Conversation.messages.nodes.length);

                    requestAnimationFrame(() => this.setState({ loadingEarlier: false, eof: false, redraw: {} }));
                    return {
                        ...prev,

                        // There are bugs that the calls are excuted twice
                        // a lot of notes on the internet
                        Conversation: {
                            ...fetchMoreResult.Conversation,
                            messages: {
                                ...fetchMoreResult.Conversation.messages,
                                nodes: mergeMessages(prev.Conversation!.messages.nodes, fetchMoreResult.Conversation.messages.nodes),
                            },
                        },
                    };
                },
            });
        });
    }

    markConversationRead() {
        const client = cachedAolloClient();

        // we are klicked and must be in the list
        const conversation = client.readQuery<Conversation, ConversationVariables>({
            query: GetConversationQuery,
            variables: {
                id: this.props.conversationId,
                token: undefined,
            },
        });

        if (conversation == null) { return; }

        logger.log('Marking conversation', this.props.conversationId, 'read!');
        client.writeQuery<Conversation>({
            query: GetConversationQuery,
            data: {
                ...conversation,
                Conversation: {
                    ...conversation.Conversation,
                    hasUnreadMessages: false,
                },
            },
        });
    }

    render() {
        return (
            <Query<Conversation, ConversationVariables>
                query={GetConversationQuery}
                variables={{
                    id: this.props.conversationId,
                    token: undefined,
                }}
                fetchPolicy="cache-and-network"
            >
                {({ client, loading, data, fetchMore, error, subscribeToMore, refetch }) => {
                    this.refetch = refetch;

                    let messages;
                    if (error) {
                        // not a connection problem
                        if (this.props.websocket) {
                            throw error;
                        } else {
                            const cachedConv = client.readQuery<Conversation, ConversationVariables>({
                                query: GetConversationQuery,
                                variables: {
                                    id: this.props.conversationId,
                                    token: undefined,
                                },
                            }, true);

                            if (cachedConv) {
                                messages = cachedConv.Conversation?.messages;
                            }
                        }
                    }

                    if (loading && (!data || !data.Conversation) && !messages) {
                        return <FullScreenLoading />;
                    }

                    if (data?.Conversation?.messages) {
                        messages = data.Conversation.messages;
                        setTimeout(() => this.markConversationRead());
                    }

                    if (data?.Conversation?.members) {
                        requestAnimationFrame(() =>
                            // @ts-ignore
                            this.props.partiesResolved(data.Conversation.members[0]),
                        );
                    }

                    return React.cloneElement<InjectedProps>(this.props.children, {
                        extraData: this.state.redraw,
                        userId: data && data.Me ? data.Me.id : -1,

                        subscribe: this._subscribeToMore(subscribeToMore),
                        isLoadingEarlier: this.state.loadingEarlier,
                        loadEarlier: !this.state.eof,

                        onLoadEarlier: this._loadEarlier(fetchMore, messages),

                        messages: this._merge(
                            (messages || { nodes: [] }).nodes.map(this._convertTransportMessage),
                            this.props.pendingMessages.map(this._convertTemp),
                        ),
                    });
                }}
            </Query>
        );
    }
}

export const ConversationQuery =
    connect(
        (state: IAppState) => ({
            websocket: state.connection.websocket,
            chatEnabled: state.settings.notificationsOneToOneChat == null
                ? true
                : state.settings.notificationsOneToOneChat,
            pendingMessages: state.chat.pendingSend,
        }),
        {},
    )(withNavigation(ConversationQueryBase));
