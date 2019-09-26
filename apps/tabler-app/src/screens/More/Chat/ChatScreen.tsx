import _ from 'lodash';
import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Query } from 'react-apollo';
import { IMessage } from 'react-native-gifted-chat';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { ScreenWithHeader } from '../../../components/Screen';
import { Categories, Logger } from '../../../helper/Logger';
import { Conversation, ConversationVariables } from '../../../model/graphql/Conversation';
import { newChatMessage } from '../../../model/graphql/newChatMessage';
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
class ChatScreenBase extends AuditedScreen<Props & NavigationInjectedProps<any>, State> {
    ref: any;

    constructor(props) {
        super(props, AuditScreenName.Conversation);

        this.state = { loadingEarlier: false, eof: false };
    }

    _sendMessage = async (messages: IMessage[]) => {
        await cachedAolloClient().mutate({
            mutation: SendMessageMutation,
            variables: {
                message: messages[0].text,
            },
        });
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    title: 'Chat',
                    showBack: true,
                }}
            >
                {/* <View style={[styles.container, { backgroundColor: this.props.theme.colors.surface }]}> */}
                <Query<Conversation, ConversationVariables>
                    query={GetConversationQuery}
                    variables={{
                        token: undefined,
                    }}
                    fetchPolicy="network-only"
                >
                    {({ loading, data, fetchMore /*error, refetch*/, subscribeToMore }) => {
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

                                            return {
                                                ...prev,
                                                Conversation: {
                                                    ...prev.Conversation,
                                                    messages: {
                                                        ...prev.Conversation!.messages,
                                                        nodes: [newFeedItem, ...prev.Conversation!.messages.nodes],
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
                                                            nodes:
                                                                _([...prev.Conversation!.messages.nodes, ...fetchMoreResult.Conversation.messages.nodes])
                                                                    .uniqBy((f) => f.id)
                                                                    .toArray()
                                                                    .value(),
                                                        },
                                                    },
                                                };
                                            },
                                        });
                                    });
                                }}

                                messages={
                                    (messages || { nodes: [] }).nodes.map((m: any) => ({
                                        _id: m.id,
                                        createdAt: new Date(m.createdAt),
                                        user: {
                                            _id: m.senderId,
                                        },
                                        text: m.payload,
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

export const ChatScreen = withTheme(withNavigation(ChatScreenBase));
