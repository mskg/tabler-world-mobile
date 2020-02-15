import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useQuery } from 'react-apollo';
import { Platform, StyleSheet, View } from 'react-native';
import { Caption, Card, Theme } from 'react-native-paper';
import { I18N } from '../../i18n/translation';
import { Conversation, ConversationVariables } from '../../model/graphql/Conversation';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';

type Props = { id: string, theme: Theme };

export const LastMessage = ({ id, theme }: Props) => {
    const { data } = useQuery<Conversation, ConversationVariables>(
        GetConversationQuery,
        {
            variables: { id },
            fetchPolicy: 'cache-first',
        },
    );

    if (data?.Conversation?.messages?.nodes == null || data.Conversation.messages.nodes.length === 0) {
        return null;
    }

    // @ts-ignore
    const payload = data.Conversation.messages.nodes[0].payload;

    return (
        <Card.Content style={styles.chipContainer}>
            <View style={styles.textRow}>
                {payload.image && (
                    <Ionicons
                        name="md-image"
                        size={15}
                        color={theme.colors.text}
                        style={styles.icon}
                    />
                )}

                <Caption
                    style={styles.caption}
                    numberOfLines={1}
                >
                    {payload.text ?? I18N.Screen_Conversations.photo}
                </Caption>
            </View>
        </Card.Content>
    );
};

const styles = StyleSheet.create({
    caption: { flex: 1, marginVertical: 0, lineHeight: 15 },
    icon: { paddingRight: 7, opacity: 0.54 },
    textRow: { flexDirection: 'row', justifyContent: 'flex-start' },

    chipContainer: {
        marginTop: Platform.OS === 'ios' ? 0 : 8,
        marginLeft: 56,
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
});
