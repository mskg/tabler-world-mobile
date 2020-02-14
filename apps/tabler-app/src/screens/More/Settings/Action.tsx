import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
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
            <MaterialIcons style={{ marginRight: -8 }} name="chevron-right" color={theme.colors.accent} size={24} />
        </View>
    </TouchableRipple>
);

export const NavigationItem = ({ icon, theme, text, onPress }) => (
    <TouchableRipple onPress={onPress} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.rowicon]}>
            <View style={{ width: 38, height: 38, marginRight: 16, alignItems: 'center' }}>
                {typeof (icon) === 'object'
                    ? icon
                    : <Ionicons name={icon} color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} size={38} />
                }
            </View>
            <Text>{text}</Text>
        </View>
    </TouchableRipple>
);
