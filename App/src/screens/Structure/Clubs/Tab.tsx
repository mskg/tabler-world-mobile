import React from 'react';
import { View } from 'react-native';
import { withTheme } from 'react-native-paper';

export const Tab = withTheme(({ theme, children }) => (<View style={{ width: '100%', height: '100%', backgroundColor: theme.colors.background }}>
    {children}
</View>));
