import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { I18N } from '../../i18n/translation';

const WaitingForNetworkBase = ({ theme }) => (
    <View
        key="icon"
        style={{
            flex: 1,
            paddingHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <ActivityIndicator />
        <Text
            numberOfLines={1}
            style={{
                marginLeft: 8,
                fontFamily: theme.fonts.regular,
                fontSize: Platform.OS === 'ios' ? 14 : 17,
            }}
        >
            {I18N.Conversations.network}
        </Text>
    </View>
);

export const WaitingForNetwork = withTheme(WaitingForNetworkBase);
