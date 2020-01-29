import { DataProxy } from 'apollo-cache';
import * as ImageManipulator from 'expo-image-manipulator';
import { SaveFormat } from 'expo-image-manipulator';
import { reverse, sortBy, uniqBy } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, Platform, View } from 'react-native';
import { IChatMessage } from 'react-native-gifted-chat';
import { Appbar, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { ChatDisabledBanner } from '../../components/ChatDisabledBanner';
import { FullScreenLoading } from '../../components/Loading';
import { MemberAvatar } from '../../components/MemberAvatar';
import { ScreenWithHeader } from '../../components/Screen';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { Conversation, ConversationVariables, Conversation_Conversation_members, Conversation_Conversation_messages_nodes } from '../../model/graphql/Conversation';
import { newChatMessage, newChatMessageVariables } from '../../model/graphql/newChatMessage';
import { PrepareFileUpload, PrepareFileUploadVariables } from '../../model/graphql/PrepareFileUpload';
import { SendMessage, SendMessageVariables } from '../../model/graphql/sendMessage';
import { IAppState } from '../../model/IAppState';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { newChatMessageSubscription } from '../../queries/Conversations/newChatMessageSubscription';
import { PrepareFileUploadMutation } from '../../queries/Conversations/PrepareFileUploadMutation';
import { SendMessageMutation } from '../../queries/Conversations/SendMessageMutation';
import { IConversationParams, showProfile } from '../../redux/actions/navigation';
import { Chat } from './Chat';
import { MetricNames } from '../../analytics/MetricNames';

const logger = new Logger(Categories.Screens.Conversation);

type Props = {
    theme: Theme,
    showProfile: typeof showProfile,
    websocket: boolean,
    chatEnabled: boolean,
};

type State = {
    icon?: React.ReactElement,
    redraw?: any,
    loadingEarlier: boolean,
    eof: boolean,
};

const PENDING = '_pending';
const FAILED = '_failed';

// tslint:disable: max-func-body-length
class ConversationScreenBase extends AuditedScreen<Props & NavigationInjectedProps<IConversationParams>, State> {
    refetch: any;

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

    _uploadImage = async (baseImage: string): Promise<string | null> => {
        this.audit.increment(MetricNames.Pictures);
        const client = cachedAolloClient();

        const resizedImage = await ImageManipulator.manipulateAsync(
            baseImage,
            [
                {
                    resize: {
                        width: 1920,
                    },
                },
                {
                    resize: {
                        height: 1080,
                    },
                },
            ],
            {
                compress: 0.75,
                format: SaveFormat.JPEG,
            },
        );

        const imageUri = resizedImage.uri;

        const signedUrl = await client.mutate<PrepareFileUpload, PrepareFileUploadVariables>({
            mutation: PrepareFileUploadMutation,
            variables: {
                conversationId: this.getConversationId(),
            },
        });

        logger.log('url', signedUrl);

        if (signedUrl.data) {
            const params = signedUrl.data.prepareFileUpload;

            const formData = new FormData();
            // formData.append('Content-Type', 'image/jpeg');
            Object.entries(params.fields).forEach(([k, v]) => {
                formData.append(k, v as string);
            });

            // required
            formData.append('Content-Type', 'image/jpeg');

            // @ts-ignore
            formData.append('file', { uri: imageUri, type: 'image/jpeg', name: 'upload.jpg' });

            logger.log('Uploading', imageUri);
            const result = await fetch(params.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (result.status >= 300) {
                throw new Error(result.status + ' ' + result.statusText);
            }

            return params.fields.key as string;
        }

        return null;
    }

    _sendMessage = (messages: IChatMessage[]) => {
        this.audit.increment(MetricNames.Messages);

        const client = cachedAolloClient();

        const optimisticMessage = {
            __typename: 'ChatMessage',
            eventId: PENDING,
            id: messages[0]._id,
            receivedAt: messages[0].createdAt || new Date(),
            senderId: messages[0].user._id,
            payload: {
                __typename: 'ChatMessagePayload',
                // we must convert to null
                image: messages[0].image ? messages[0].image : null,
                text: messages[0].text ? messages[0].text : null,
            },
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
                    let image: string | null = null;
                    if (messages[0].image != null) {
                        image = await this._uploadImage(messages[0].image);
                        // need to check fail here
                    }

                    await client.mutate<SendMessage, SendMessageVariables>({
                        mutation: SendMessageMutation,
                        variables: {
                            image,
                            id: optimisticMessage.id,
                            text: optimisticMessage.payload.text,
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

    showProfile() {
        const client = cachedAolloClient();
        const result = client.readQuery<Conversation, ConversationVariables>({
            query: GetConversationQuery,
            variables: {
                id: this.getConversationId(),
            },
        });

        if (result) {
            this.props.showProfile(result.Conversation!.members[0].id);
        }
    }

    assignIcon(member: Conversation_Conversation_members) {
        if (this.state.icon != null || member == null || member.pic !== '' || member.pic == null) { return; }

        this.setState({
            icon: (
                <View key="icon" style={{ flex: 1, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <MemberAvatar member={member} />
                    <Text numberOfLines={1} style={{ marginLeft: 8, fontFamily: this.props.theme.fonts.medium, fontSize: Platform.OS === 'ios' ? 17 : 20 }}>{this.getTitle()}</Text>
                </View>
            ),
        });
    }

    defaultIcon() {
        return (
            <Appbar.Content
                key="cnt"
                style={{ paddingLeft: this.state.icon ? 0 : 12 }}
                titleStyle={{ fontFamily: this.props.theme.fonts.medium }}
                title={this.getTitle()}
            />
        );
    }

    waitingForNetwork() {
        return (
            <View key="icon" style={{ flex: 1, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
                <Text numberOfLines={1} style={{ marginLeft: 8, fontFamily: this.props.theme.fonts.regular, fontSize: Platform.OS === 'ios' ? 14 : 17 }}>{I18N.Conversations.network}</Text>
            </View>
        );
    }

    componentDidUpdate(prev) {
        if (prev.websocket !== this.props.websocket && this.props.websocket) {
            if (this.refetch) {
                this.refetch();
            }
        }
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    showBack: true,
                    content: [
                        !this.props.websocket ? this.waitingForNetwork() : (this.state.icon || this.defaultIcon()),
                        <Appbar.Action key="new" icon="info-outline" onPress={() => this.showProfile()} />,
                    ],
                }}
            >
                <ChatDisabledBanner />

                {/* <View style={[styles.container, { backgroundColor: this.props.theme.colors.surface }]}> */}
                <Query<Conversation, ConversationVariables>
                    query={GetConversationQuery}
                    variables={{
                        id: this.getConversationId(),
                        token: undefined,
                    }}
                    fetchPolicy="cache-and-network"
                >
                    {({ loading, data, fetchMore /*error, refetch*/, subscribeToMore, refetch }) => {
                        this.refetch = refetch;

                        if (loading && (!data || !data.Conversation)) {
                            return <FullScreenLoading />;
                        }

                        let messages;
                        if (data && data.Conversation && data.Conversation.messages) {
                            messages = data.Conversation.messages;

                            const member = data.Conversation.members[0];
                            setTimeout(() => this.assignIcon(member));
                        }

                        return (
                            <Chat
                                userId={data && data.Me ? data.Me.id : -1}
                                sendDisabled={!this.props.websocket || !this.props.chatEnabled}

                                extraData={this.state.redraw}
                                subscribe={
                                    // we need to create a function that is executed once
                                    () => {
                                        subscribeToMore<newChatMessage, newChatMessageVariables>({
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
                                                    ...prev,
                                                    Conversation: {
                                                        ...prev.Conversation,
                                                        messages: {
                                                            ...prev.Conversation!.messages,
                                                            nodes: this.merge([newFeedItem], prev.Conversation!.messages.nodes),
                                                        },
                                                    },
                                                } as Conversation;
                                            },
                                        });
                                    }
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
                                                    ...prev,

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

                                        text: m.payload.text,
                                        image: m.payload.image,

                                        sent: m.accepted || m.delivered ? true : false,
                                        received: m.delivered ? true : false,
                                        pending: !(m.accepted || m.delivered),

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

export const ConversationScreen = connect(
    (state: IAppState) => ({
        websocket: state.connection.websocket,
        chatEnabled: state.settings.notificationsOneToOneChat == null ?
            true : state.settings.notificationsOneToOneChat,
    }),
    { showProfile },
)(withTheme(withNavigation(ConversationScreenBase)));
