import { Ionicons } from '@expo/vector-icons';
import { first } from 'lodash';
import React from 'react';
import { Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { MemberListItem } from '../../components/Member/MemberListItem';
import { SwipableItem, SwipeButtonsContainer } from '../../components/SwipableItem';
import { TextImageAvatar } from '../../components/TextImageAvatar';
import { GetConversations, GetConversations_Conversations_nodes } from '../../model/graphql/GetConversations';
import { RemoveConversation, RemoveConversationVariables } from '../../model/graphql/RemoveConversation';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { RemoveConversationMutation } from '../../queries/Conversations/RemoveConversationMutation';
import { showConversation } from '../../redux/actions/navigation';
import { LastMessage } from './LastMessage';
import { UnreadMessages } from './UnreadMessages';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';

type OwnProps = {
    theme: Theme,
    conversation: GetConversations_Conversations_nodes,
};

type StateProps = {
};

type DispatchPros = {
    showConversation: typeof showConversation,
};

type Props = OwnProps & StateProps & DispatchPros;

/*
● BLACK CIRCLE          25CF
⚫ MEDIUM BLACK CIRCLE  26AB
⬤ BLACK LARGE CIRCLE   2B24
*/

// tslint:disable-next-line: export-name
class ConversationListItemBase extends React.PureComponent<Props> {
    ref;

    getSnapshotBeforeUpdate(prevProps: Props) {
        if (prevProps.conversation !== this.props.conversation) {
            return true;
        }

        return false;
    }

    componentDidUpdate(_prevProps, _prevState, snapshot) {
        if (snapshot) {
            this.ref.close();
        }
    }

    _onPress = () => this.props.showConversation(
        this.props.conversation.id,
        this.props.conversation.subject,
    )

    _remove = () => {
        requestAnimationFrame(async () => {
            const client = cachedAolloClient();
            await client.mutate<RemoveConversation, RemoveConversationVariables>({
                mutation: RemoveConversationMutation,
                variables: {
                    id: this.props.conversation.id,
                },
            });

            let conversations;

            try {
                conversations = client.readQuery<GetConversations>({
                    query: GetConversationsQuery,
                });
            } catch { }

            if (conversations == null) {
                const temp = await client.query<GetConversations>({
                    query: GetConversationsQuery,
                });

                conversations = temp.data;
            }

            const nodes = conversations ? conversations.Conversations.nodes : [];

            // this causes a UI update
            client.writeQuery<GetConversations>({
                query: GetConversationsQuery,
                data: {
                    Conversations: {
                        ...conversations.Conversations,
                        nodes: nodes.filter((c) => c.id !== this.props.conversation.id),
                    },
                },
            });

            if (this.ref) {
                this.ref.close();
            }
        });
    }

    render() {
        // might be null what is ok
        const otherParticipant = first(this.props.conversation.participants.filter((p) => !p.iscallingidentity));

        return (
            <SwipableItem
                ref={(o) => { this.ref = o; }}

                rightButtons={(
                    <SwipeButtonsContainer
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            // height: this.props.height,
                            backgroundColor: this.props.theme.colors.accent,
                        }}
                    >
                        <TouchableRipple
                            onPress={this._remove}
                            style={{
                                height: '100%',
                                width: 24 * 3,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: this.props.theme.colors.accent,
                            }}
                        >
                            <Ionicons
                                size={24}
                                name={'md-trash'}
                                color={this.props.theme.colors.placeholder}
                            />
                        </TouchableRipple>
                    </SwipeButtonsContainer>
                )}
            >
                <MemberListItem
                    // the cast is ok, we can ignore the roles
                    member={otherParticipant?.member as IMemberOverviewFragment}
                    theme={this.props.theme}

                    title={this.props.conversation.subject || ''}
                    subtitle={otherParticipant?.member ? undefined : 'Past Member'}

                    left={() => (
                        <TextImageAvatar
                            source={this.props.conversation.pic}
                            size={38}
                            label={this.props.conversation.subject.substr(0, 2).toUpperCase()}
                        />
                    )}

                    right={() => (
                        <UnreadMessages
                            unread={this.props.conversation.hasUnreadMessages}
                            id={this.props.conversation.id}
                            theme={this.props.theme}
                        />
                    )}

                    bottom={() => <LastMessage theme={this.props.theme} id={this.props.conversation.id} />}
                    onPress={this._onPress}
                />
            </SwipableItem>
        );
    }
}

export const ConversationListItem = withTheme(connect(null, {
    showConversation,
})(ConversationListItemBase));
