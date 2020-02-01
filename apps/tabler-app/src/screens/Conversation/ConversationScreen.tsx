import React from 'react';
import { Platform, View } from 'react-native';
import { Appbar, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { MetricNames } from '../../analytics/MetricNames';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { ChatDisabledBanner } from '../../components/ChatDisabledBanner';
import { withGoHomeErrorBoundary } from '../../components/ErrorBoundary';
import { HandleAppState } from '../../components/HandleAppState';
import { HandleScreenState } from '../../components/HandleScreenState';
import { MemberAvatar } from '../../components/MemberAvatar';
import { ScreenWithHeader } from '../../components/Screen';
import { Conversation, ConversationVariables, Conversation_Conversation_members } from '../../model/graphql/Conversation';
import { IAppState } from '../../model/IAppState';
import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { clearActiveConversation, sendMessage, sendPendingMessages, setActiveConversation } from '../../redux/actions/chat';
import { IConversationParams, showProfile } from '../../redux/actions/navigation';
import { Chat } from './Chat';
import { ConversationQuery } from './ConversationQuery';
import { IChatMessage } from './IChatMessage';
import { WaitingForNetwork } from './WaitingForNetwork';

type Props = {
    theme: Theme,
    showProfile: typeof showProfile,

    setActiveConversation: typeof setActiveConversation,
    clearActiveConversation: typeof clearActiveConversation,

    sendMessage: typeof sendMessage;
    sendPendingMessages: typeof sendPendingMessages;

    websocket: boolean,
    chatEnabled: boolean,

    pendingMessages: IPendingChatMessage[],
};

type State = {
    member?: Conversation_Conversation_members,
    icon?: any,
};

// tslint:disable: max-func-body-length
class ConversationScreenBase extends AuditedScreen<Props & NavigationInjectedProps<IConversationParams>, State> {
    constructor(props) {
        super(props, AuditScreenName.Conversation);
        this.state = {};
    }

    _registerConversation = () => {
        this.props.setActiveConversation(this.getConversationId());
    }

    _unregisterConversation = () => {
        this.props.clearActiveConversation();
    }

    _sendMessage = (messages: IChatMessage[]) => {
        for (const msg of messages) {
            this.audit.increment(MetricNames.Messages);
            this.props.sendMessage({
                id: msg._id,
                sender: msg.user._id,
                conversationId: this.getConversationId(),
                image: msg.image,
                text: msg.text,
            } as IPendingChatMessage);
        }

        this.props.sendPendingMessages();
    }

    getConversationId() {
        return (this.props.navigation.state.params as IConversationParams).id as string;
    }

    getTitle() {
        return (this.props.navigation.state.params as IConversationParams).title as string;
    }

    showProfile() {
        if (this.state.member) {
            this.props.showProfile(this.state.member.id);
        } else {
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
    }

    _assignIcon = (member: Conversation_Conversation_members) => {
        if (this.state.icon || member.pic == null || member.pic === '') { return; }

        this.setState({
            member,
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
            <WaitingForNetwork key="network" />
        );
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

                <HandleScreenState
                    onBlur={this._unregisterConversation}
                    onFocus={this._registerConversation}
                    triggerOnFirstMount={true}
                    triggerOnUnmount={true}
                />

                <HandleAppState
                    triggerOnUnmount={true}
                    onInactive={this._unregisterConversation}
                    onActive={this._registerConversation}
                />

                <ConversationQuery
                    conversationId={this.getConversationId()}
                    partiesResolved={this._assignIcon}
                >
                    <Chat
                        sendDisabled={!this.props.websocket || !this.props.chatEnabled}
                        sendMessage={this._sendMessage}
                    />
                </ConversationQuery>
            </ScreenWithHeader >
        );
    }
}

export const ConversationScreen =
    withGoHomeErrorBoundary(
        connect(
            (state: IAppState) => ({
                websocket: state.connection.websocket,
                chatEnabled: state.settings.notificationsOneToOneChat == null
                    ? true
                    : state.settings.notificationsOneToOneChat,
                pendingMessages: state.chat.pendingSend,
            }),
            {
                showProfile,
                setActiveConversation,
                clearActiveConversation,
                sendMessage,
                sendPendingMessages,
            },
        )(withTheme(withNavigation(ConversationScreenBase))),
    );
