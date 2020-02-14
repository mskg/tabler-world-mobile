import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Query } from 'react-apollo';
import { Card, Text, Theme, TouchableRipple, withTheme, Caption } from 'react-native-paper';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { MemberListItem } from '../../components/Member/MemberListItem';
import { styles } from '../../components/Member/Styles';
import { SwipableItem, SwipeButtonsContainer } from '../../components/SwipableItem';
import { Conversation, ConversationVariables } from '../../model/graphql/Conversation';
import { GetConversations, GetConversations_Conversations_nodes } from '../../model/graphql/GetConversations';
import { RemoveConversation, RemoveConversationVariables } from '../../model/graphql/RemoveConversation';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { RemoveConversationMutation } from '../../queries/Conversations/RemoveConversationMutation';
import { showConversation } from '../../redux/actions/navigation';
import { I18N } from '../../i18n/translation';
import { View } from 'react-native';

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

const LastMessage = ({ id, theme }) => (
    <Query<Conversation, ConversationVariables>
        query={GetConversationQuery}
        variables={{ id }}
        fetchPolicy="cache-first"
    >
        {({ data }) => {
            if (data?.Conversation?.messages?.nodes == null || data.Conversation.messages.nodes.length === 0) {
                return null;
            }

            // @ts-ignore
            const nodes = data.Conversation.messages.nodes;

            return (
                <Card.Content style={[styles.chipContainer, { marginBottom: 8 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                        {nodes[0].payload.image && (
                            <Ionicons
                                name="md-image" size={15}
                                color={theme.colors.text}
                                style={{ paddingRight: 7, opacity: 0.54 }}
                            />
                        )}

                        <Caption
                            style={{ flex: 1, marginVertical: 0, lineHeight: 15, }}
                            numberOfLines={1}
                        >
                            {nodes[0].payload.text ?? I18N.Conversations.photo}
                        </Caption>
                    </View>
                </Card.Content>
            );
        }}
    </Query>
);

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

            let conversations;

            try {
                conversations = client.readQuery<GetConversations>({
                    query: GetConversationsQuery,
                });
            }
            catch { }

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
