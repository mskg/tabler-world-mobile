import gql from 'graphql-tag';
import _ from 'lodash';
import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Query } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { Bubble, GiftedChat, IMessage } from 'react-native-gifted-chat';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { ScreenWithHeader } from '../../../components/Screen';
import { Categories, Logger } from '../../../helper/Logger';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
import { BOTTOM_HEIGHT } from '../../../theme/dimensions';

const logger = new Logger(Categories.Screens.Conversation);

type Props = {
    theme: Theme,
};


const listenMessageSubscription = gql`
	subscription {
		ChatMessages {
            id
            payload
            sender {
              id
            }
            createdAt
		}
	}
`;

const messagesQuery = gql`
    query messages($token: String) {
      Conversation(id: "IkNPTlYoOjE6LDoxMDQzMDopIg") {
        messages (token: $token) @connection(key: "ConversationMessages") {
          nodes {
            id
            payload
            sender {
              id
            }
            createdAt
          }
          nextToken
        }
      }
    }
`;

const sendMessageMutation = gql`
	mutation sendMessage($message: String!) {
		startConversation(member: 1) {
			id
		}

		sendMessage(message: $message, conversation: "IkNPTlYoOjE6LDoxMDQzMDopIg==") {
			id
			payload
			createdAt
		}
	}
`;

// tslint:disable: max-func-body-length
class ChatScreenBase extends AuditedScreen<Props & NavigationInjectedProps<any>> {
    ref: any;

    constructor(props) {
        super(props, AuditScreenName.Conversation);
    }

    _renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}

                // @ts-ignore
                wrapperStyle={{
                    left: {
                        backgroundColor: this.props.theme.colors.background,
                    },

                    right: {
                        backgroundColor: this.props.theme.colors.accent,
                    },
                }}

                // @ts-ignore
                textProps={{
                    style: {
                        fontFamily: this.props.theme.fonts.regular,
                    },
                }}

                timeTextStyle={{
                    left: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                    },
                    right: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                    },
                }}

                textStyle={{
                    left: {
                        color: this.props.theme.colors.text,
                        fontSize: 13,
                    },
                    right: {
                        color: this.props.theme.colors.text,
                        fontSize: 13,
                    },
                }}
            />
        );
    }

    _sendMessage = async (messages: IMessage[]) => {
        await cachedAolloClient().mutate({
            mutation: sendMessageMutation,
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
                <View style={[styles.container, { backgroundColor: this.props.theme.colors.surface }]}>
                    <Query
                        query={messagesQuery}
                        variables={{
                            token: undefined,
                        }}
                        fetchPolicy="network-only"
                    >
                        {({ loading, data, fetchMore /*error, refetch*/, subscribeToMore }) => {
                            const { Conversation: { messages } = {} } = data || {};

                            subscribeToMore({
                                document: listenMessageSubscription,
                                updateQuery: (prev, { subscriptionData }) => {
                                    if (!subscriptionData.data) return prev;
                                    const newFeedItem = subscriptionData.data.ChatMessages;

                                    return {
                                        ...prev,
                                        Conversation: {
                                            ...prev.Conversation,
                                            messages: {
                                                ...prev.Conversation.messages,
                                                nodes: [newFeedItem, ...prev.Conversation.messages.nodes],
                                            },
                                        },
                                    };
                                },
                            });

                            return (
                                <GiftedChat
                                    user={{ _id: 10430 }}
                                    bottomOffset={BOTTOM_HEIGHT}

                                    locale="en"

                                    renderAvatar={null}
                                    onSend={this._sendMessage}

                                    showUserAvatar={false}
                                    showAvatarForEveryMessage={false}

                                    isLoadingEarlier={loading}
                                    loadEarlier={messages && !messages.eof}
                                    onLoadEarlier={() => {
                                        logger.log(messages.nextToken);

                                        if (messages && messages.nextToken == null) {
                                            return;
                                        }

                                        fetchMore({
                                            variables: {
                                                token: messages.nextToken,
                                            },

                                            updateQuery: (previousResult, { fetchMoreResult }) => {
                                                // Don't do anything if there weren't any new items
                                                if (!fetchMoreResult || fetchMoreResult.Conversation.messages.nodes.length === 0) {
                                                    logger.log('no new data');
                                                    return previousResult;
                                                }

                                                logger.log('appending', fetchMoreResult.Conversation.messages.nodes.length);

                                                return {
                                                    // There are bugs that the calls are excuted twice
                                                    // a lot of notes on the internet
                                                    Conversation: {
                                                        ...fetchMoreResult.Conversation,
                                                        messages: {
                                                            ...fetchMoreResult.Conversation.messages,
                                                            nodes:
                                                                _([...previousResult.Conversation.messages.nodes, ...fetchMoreResult.Conversation.messages.nodes])
                                                                    .uniqBy((f) => f.id)
                                                                    .toArray()
                                                                    .value(),
                                                        },
                                                    },
                                                };
                                            },
                                        });
                                    }}

                                    messages={
                                        messages
                                            ? messages.nodes.map((m: any) => ({
                                                _id: m.id,
                                                createdAt: new Date(m.createdAt),
                                                user: {
                                                    _id: m.sender.id,
                                                },
                                                text: m.payload,
                                            }))
                                            : []
                                    }
                                />
                            );
                        }}
                    </Query>
                </View>
            </ScreenWithHeader >
        );
    }
}

const empty = { Conversation: { messages: { nodes: [] } } };

export const ChatScreen = withTheme(withNavigation(ChatScreenBase));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
