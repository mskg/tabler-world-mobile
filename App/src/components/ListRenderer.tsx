

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Theme } from 'react-native-paper';
import { IMemberOverviewFragment } from '../model/IMemberOverviewFragment';
import { Section } from './List/Section';
import { MemberItemWithSwipe } from './Member/MemberItemWithSwipe';

export function renderItem(
    item: IMemberOverviewFragment | string,
    theme: Theme,
    onPress?: (item: IMemberOverviewFragment) => void,
    margin: number = 30,
    height?: number,
) {
    if (typeof (item) === 'string') {
        return <Section title={item} backgroundColor={theme.colors.primary} />;
    }

    return (
        <>
            <MemberItemWithSwipe height={height} theme={theme} onPress={onPress} item={item} margin={margin} />
            {renderDivider(theme)}
        </>
    );
}

export function renderDivider(theme: Theme) {
    return <View style={{ backgroundColor: theme.colors.surface, height: StyleSheet.hairlineWidth }}>
        <Divider inset={true} theme={theme} />
    </View>;
}

export function extractKey(item: IMemberOverviewFragment | string) {
    return typeof (item) === 'string' ? item : item.id.toString();
}
