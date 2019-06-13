import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { styles } from './Styles';

export const Action = ({ theme, text, onPress }) => (
    <TouchableRipple onPress={onPress} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.row]}>
            <Text style={{ color: theme.colors.accent }}>{text}</Text>
        </View>
    </TouchableRipple>
);

export const NextScreen = ({ theme, text, onPress }) => (
    <TouchableRipple onPress={onPress} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.row]}>
            <Text>{text}</Text>
            <MaterialIcons style={{marginRight: -8}} name="chevron-right" color={theme.colors.accent} size={24} />
        </View>
    </TouchableRipple>
);