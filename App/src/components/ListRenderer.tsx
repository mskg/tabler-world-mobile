

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Theme } from 'react-native-paper';
import { IMember } from '../model/IMember';
import { Section } from './List/Section';
import { MemberListItem } from "./Member/MemberListItem";

export function renderItem(
    item: IMember | string,
    theme: Theme,
    onPress?: (item: IMember) => void,
    margin?: number,
    height?: number,
    ) {
    if (typeof (item) === "string") {
        return <Section title={item} backgroundColor={theme.colors.primary} />
    }

    return (
        <>
            <MemberListItem height={height} theme={theme} onPress={onPress} member={item} margin={margin} />
            {renderDivider(theme)}
        </>
    );
}

export function renderDivider(theme: Theme) {
    return <View style={{ backgroundColor: theme.colors.surface, height: StyleSheet.hairlineWidth }}>
        <Divider inset={true} theme={theme} />
    </View>
}

export function extractKey(item: IMember | string) {
    return typeof (item) === "string" ? item : item.id.toString();
}
