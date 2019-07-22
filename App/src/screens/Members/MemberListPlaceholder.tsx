import React from 'react';
import { Surface } from 'react-native-paper';
import { MemberListItemPlaceholder } from '../../components/Placeholder/MemberListItemPlaceholder';

export const MemberListPlaceholder = ({ count }) => (
    <Surface>
        <MemberListItemPlaceholder icon={48 + 16} padding={16} width={200} />

        {Array.apply(null, { length: count || 10 })
            .map(Number.call, Number)
            .map(i => (<MemberListItemPlaceholder width={200} key={i} />))}
    </Surface>);
