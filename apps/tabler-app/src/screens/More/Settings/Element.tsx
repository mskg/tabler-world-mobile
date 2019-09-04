import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
import { styles } from './Styles';

export const Element = ({ theme, field, text }) => (
    <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
        <Text>{field}</Text>
        {typeof (text) === 'string' && <Text style={{ color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY }}>{text}</Text>}
        {typeof (text) !== 'string' && text}
    </View>
);
