import React from 'react';
import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { styles } from './styles';

export const Element = ({ theme, title, onPress, right }: {
    theme;
    title;
    onPress;
    right?;
}) => (
<TouchableRipple style={{ backgroundColor: theme.colors.surface }} onPress={() => requestAnimationFrame(() => onPress())}>
    <View style={[styles.row]} pointerEvents="none">
        <Text>{title}</Text>
        {right}
    </View>
</TouchableRipple>
);
