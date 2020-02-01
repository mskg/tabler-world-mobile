import { ApolloQueryResult, FetchMoreOptions, FetchMoreQueryOptions } from 'apollo-client';
import { filter, maxBy, remove, reverse, sortBy, uniqBy } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { HandleAppState } from '../../components/HandleAppState';
import { HandleScreenState } from '../../components/HandleScreenState';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { Categories, Logger } from '../../helper/Logger';
import { Conversation, ConversationVariables, Conversation_Conversation_members, Conversation_Conversation_messages, Conversation_Conversation_messages_nodes } from '../../model/graphql/Conversation';
import { newChatMessage } from '../../model/graphql/newChatMessage';
import { IAppState } from '../../model/IAppState';
import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { newChatMessageSubscription } from '../../queries/Conversations/newChatMessageSubscription';
import { setBadge } from '../../redux/actions/chat';
import { IConversationParams } from '../../redux/actions/navigation';
import { ChatMessageEventId } from '../../sagas/chat/ChatMessageEventId';
import { mergeMessages } from '../../sagas/chat/mergeMessages';
import { markConversationRead, updateBadgeFromConversations } from '../Conversations/chatHelpers';
import { ConversationPlaceholder } from './ConversationPlaceholder';
import { IChatMessage } from './IChatMessage';

const logger = new Logger(Categories.Screens.Conversation);

type InjectedProps = {
    extraData: any,
    userId: number,

    isLoadingEarlier: boolean,
    loadEarlier: boolean,
    onLoadEarlier: () => void,

    messages: IChatMessage[],
};

type Props = {
    conversationId: string;

    websocket: boolean;
    pendingMessages: IPendingChatMessage[];

    children: React.ReactElement<InjectedProps>;

    partiesResolved: (member: Conversation_Conversation_members) => void;
    setBadge: typeof setBadge;
};


type State = {
    loadingEarlier: boolean,
    eof: boolean,
    redraw?: any,
};

// tslint:disable: max-func-body-length
class ConversationQueryBase extends React.PureComponent<Props & NavigationInjectedProps<IConversationParams>, State> {
    refetch!: (v: ConversationVariables) => Promise<any>;
    subscription!: ZenObservable.Subscription | null;

    constructor(props) {
        super(props);
        this.state = { loadingEarlier: false, eof: false };
    }

    _subscribe = () => {
        logger.debug('Must subscribe');
        if (!this.subscription) {
            logger.debug('> subscribe');

            try {
                this._watch();
            } catch (e) {
                logger.error(e, 'Could not subscribe');
            }
        }
    }

    _unsubscribe = () => {
        logger.debug('Must unsubscribe');
        if (this.subscription) {
            logger.debug('> unsubscribing');

            try {
                this.subscription.unsubscribe();
                this.subscription = null;
            } catch (e) {
                logger.error(e, 'Could not unsubscribe');
            }
        }

        try {
            markConversationRead(this.props.conversationId);
            updateBadgeFromConversations();
        } catch (e) { logger.log('_markConversationRead', e); }
    }

    _refresh = async () => {
        logger.debug('Try refresh');
        if (this.refetch) {
            logger.debug('> refreshing');

            try {
                await this.refetch({
                    id: this.props.conversationId,
                    token: undefined,
                });

                requestAnimationFrame(() => this.setState({ redraw: {} }));
            } catch (e) {
                logger.error(e, 'Could not refetch');
            }
        }
    }

    componentDidUpdate(prev) {
        if (prev.websocket !== this.props.websocket && this.props.websocket) {
            this._refresh();
            this._subscribe();
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

    _watch = async () => {
        if (await isDemoModeEnabled() || this.subscription) {
            return;
        }

        logger.debug('Starting watching newChatMessages', this.props.conversationId);

        const client = cachedAolloClient();
        const query = client.subscribe<newChatMessage>({
            query: newChatMessageSubscription,
            variables: {
                conversation: this.props.conversationId,
            },
        });

        this.subscription = query.subscribe(
            async (nextVal) => {
                const data = nextVal.data as newChatMessage;
                if (__DEV__) { logger.debug('received', data); }

                const prev = client.readQuery<Conversation, ConversationVariables>({
                    query: GetConversationQuery,
                    variables: {
                        id: this.props.conversationId,
                    },
                });

                if (!prev || !prev.Conversation) {
                    logger.debug('no prev?', prev);
                    return;
                }

                const nodes = mergeMessages([data.newChatMessage], prev.Conversation!.messages.nodes);
                const max = maxBy(nodes, (n) => n.delivered ? n.eventId : 'z');
                const maxEvent = max?.eventId || 'z';

                requestAnimationFrame(() => this.setState({ redraw: {} }));
                client.writeQuery<Conversation, ConversationVariables>({
                    query: GetConversationQuery,
                    variables: {
                        id: this.props.conversationId,
                    },
                    data: {
                        ...prev,
                        Conversation: {
                            ...prev.Conversation,
                            messages: {
                                ...prev.Conversation!.messages,
                                nodes: nodes.map((n) => ({
                                    ...n,
                                    delivered: n.delivered || n.eventId < maxEvent,
                                })),
                            },
                        },
                    },
                });
            },
            (e) => { logger.error(e, 'Failed to subscribe to newChatMessage'); },
        );

        logger.debug('> subscribed');
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

                    if (__DEV__) { logger.log('appending', fetchMoreResult.Conversation.messages.nodes); }

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

    render() {
        return (
            <>
                <HandleAppState
                    triggerOnUnmount={true}
                    onInactive={this._unsubscribe}
                    onActive={this._refresh}
                    triggerOnFirstMount={true}
                />

                <HandleScreenState
                    onBlur={this._unsubscribe}
                    onFocus={this._subscribe}
                    triggerOnFirstMount={true}
                />

                <Query<Conversation, ConversationVariables>
                    query={GetConversationQuery}
                    variables={{
                        id: this.props.conversationId,
                        token: undefined,
                    }}
                    fetchPolicy="cache-first"
                >
                    {({ client, loading, data, fetchMore, error, refetch }) => {
                        this.refetch = refetch;

                        let messages;
                        if (error) {
                            // not a connection problem
                            if (this.props.websocket) {
                                throw error;
                            } else {
                                const cachedConv = client.readQuery<Conversation, ConversationVariables>(
                                    {
                                        query: GetConversationQuery,
                                        variables: {
                                            id: this.props.conversationId,
                                            token: undefined,
                                        },
                                    },
                                    true,
                                );

                                if (cachedConv) {
                                    messages = cachedConv.Conversation?.messages;
                                }
                            }
                        }

                        if (loading && (!data || !data.Conversation) && !messages) {
                            return (
                                <Placeholder
                                    ready={false}
                                    previewComponent={<ConversationPlaceholder />}
                                />
                            );
                        }

                        if (data?.Conversation?.messages) {
                            messages = data.Conversation.messages;
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
            </>
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
        {
            setBadge,
        },
    )(withNavigation(ConversationQueryBase));
