import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Theme, TouchableRipple, withTheme, Text } from 'react-native-paper';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { MemberListItem } from '../../components/Member/MemberListItem';
import { SwipableItem, SwipeButtonsContainer } from '../../components/SwipableItem';
import { GetConversations, GetConversations_Conversations_nodes } from '../../model/graphql/GetConversations';
import { RemoveConversation, RemoveConversationVariables } from '../../model/graphql/RemoveConversation';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { RemoveConversationMutation } from '../../queries/Conversations/RemoveConversationMutation';
import { showConversation } from '../../redux/actions/navigation';

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
        `${this.props.conversation.members[0].firstname} ${this.props.conversation.members[0].lastname}`,
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

            let conversations = client.readQuery<GetConversations>({
                query: GetConversationsQuery,
            });

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
                    theme={this.props.theme}

                    member={this.props.conversation.members[0]}
                    right={({ size }) => {
                        if (this.props.conversation.hasUnreadMessages) {
                            return (
                                <Text style={{ marginRight: 30, color: this.props.theme.colors.accent }}>{'\u25CF'}</Text>
                                // <Ionicons
                                //     name="md-chatbubbles"
                                //     size={size}
                                //     style={{ marginRight: 30 }}
                                //     color={this.props.theme.colors.accent}
                                // />
                            );
                        }

                        return null;
                    }}

                    bottom={() => null}
                    onPress={this._onPress}
                />
            </SwipableItem>
        );
    }
}

export const ConversationListItem = withTheme(connect(null, {
    showConversation,
})(ConversationListItemBase));
