import React from 'react';
import { Animated } from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { I18N } from '../../i18n/translation';
import { NearbyListScreen } from './List/NearbyListScreen';
import { NearbyMapScreen } from './Map/NearbyMapScreen';
import { NearbyTabBar } from './NearbyTabBar';
import { Routes } from './Routes';

/**
 * MaterialTopTabBar does not allov customization of label container.
 * We override the numberOfLines here
 */
const LabelBase =
    ({ text, theme, color }) => (
        <Text
            numberOfLines={1}
            style={{ color, fontFamily: theme.fonts.medium }}
        >
            {text.toUpperCase()}
        </Text>
    );

const Label = Animated.createAnimatedComponent(withTheme(LabelBase));

export const NearbyNavigator = createMaterialTopTabNavigator(
    {
        [Routes.List]: {
            screen: NearbyListScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Screen_NearbyMembers.Tabs.list} />,
            },
        },

        [Routes.Map]: {
            screen: NearbyMapScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Screen_NearbyMembers.Tabs.map} />,
            },
        },
    },
    {
        tabBarComponent: NearbyTabBar,
        initialRouteName: Routes.List,
        lazy: true,
        swipeEnabled: true,
        // animationEnabled: true,
        tabBarPosition: 'top',
        backBehavior: 'history',
    },
);
