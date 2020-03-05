import React from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { Caption, Text, Theme } from 'react-native-paper';
import { formatTimeAgo } from '../../helper/formatting/formatTimeAgo';
import { Conversation, ConversationVariables } from '../../model/graphql/Conversation';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';

type Props = { id: string, unread: boolean, theme: Theme };

export const UnreadMessages = ({ unread, id, theme }: Props) => {
    const { data } = useQuery<Conversation, ConversationVariables>(
        GetConversationQuery,
        {
            variables: { id },
            fetchPolicy: 'cache-first',
        },
    );

    let date = null;
    if (data != null && data?.Conversation?.messages?.nodes != null && data.Conversation.messages.nodes.length > 0) {
        date = data.Conversation.messages.nodes[0].receivedAt;
    }

    return (
        <View style={styles.textRow}>
            {date && (
                <Caption
                    style={[
                        unread ? styles.captionUnread : styles.captionRead,
                        unread ? { color: theme.colors.accent } : undefined]
                    }
                    numberOfLines={1}
                >
                    {formatTimeAgo(date)}
                </Caption>
            )}

            {unread &&
                <Text style={{ lineHeight: 14, color: theme.colors.accent }}>{'\u25CF'}</Text>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    captionUnread: {
        marginVertical: 0,
        lineHeight: 18,
    },

    captionRead: {
        marginVertical: 0,
        lineHeight: 20,
    },

    textRow: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        marginRight: 16,
        marginLeft: 16,
        height: 32,
    },
});
