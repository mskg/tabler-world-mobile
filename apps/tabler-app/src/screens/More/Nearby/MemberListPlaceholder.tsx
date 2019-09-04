import React from 'react';
import { StyleSheet } from 'react-native';
import { List, Surface } from 'react-native-paper';
import { Line } from '../../../components/Placeholder/Line';
import { MemberListItemPlaceholder } from '../../../components/Placeholder/MemberListItemPlaceholder';

export const MemberListPlaceholder = () => (
    <Surface>
        <List.Section>
            <Line style={styles.line} width={200} height={20} />
            <MemberListItemPlaceholder icon={48 + 16} padding={16} width={200} />
        </List.Section>

        <List.Section>
            <Line style={styles.line} width={200} height={20} />
            <MemberListItemPlaceholder width={200} />
            <MemberListItemPlaceholder width={200} />
        </List.Section>

        <List.Section>
            <Line style={styles.line} width={200} height={20} />
            <MemberListItemPlaceholder width={200} />
            <MemberListItemPlaceholder width={200} />
            <MemberListItemPlaceholder width={200} />
        </List.Section>

        <List.Section>
            <Line style={styles.line} width={200} height={20} />
            <MemberListItemPlaceholder width={200} />
        </List.Section>

        <List.Section>
            <Line style={styles.line} width={200} height={20} />
            <MemberListItemPlaceholder width={200} />
        </List.Section>

        <List.Section>
            <Line style={styles.line} width={200} height={20} />
            <MemberListItemPlaceholder width={200} />
        </List.Section>
    </Surface>
);


const styles = StyleSheet.create({
    line: {
        marginLeft: 16,
        marginVertical: 8,
    },
});
