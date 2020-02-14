import React from 'react';
import { Animated } from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { I18N } from '../../i18n/translation';
import { CodeScreen } from './Code';
import { Routes } from './Routes';
import { ScanScreen } from './Scan';
import { PairScreen } from './Screen';

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

const Navigator = createMaterialTopTabNavigator(
    {
        [Routes.Scan]: {
            screen: ScanScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Pair.scan} />,
            },
        },

        [Routes.Me]: {
            screen: CodeScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Pair.me} />,
            },
        },
    },
    {
        tabBarComponent: PairScreen,
        initialRouteName: Routes.Scan,
        lazy: true,
        // lazy: true,
        // removeClippedSubviews: true,
        swipeEnabled: true,
        tabBarPosition: 'top',
        backBehavior: 'history',
    },
);

export default Navigator;
