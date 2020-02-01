import React from 'react';
import { Animated } from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { I18N } from '../../i18n/translation';
import { AreasScreen } from './Areas';
import { AssociationsScreen } from './Associations';
import ClubsScreen from './Clubs';
import { Routes } from './Routes';
import { StructureScreen } from './Screen';

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

export const AssociationTabs = createMaterialTopTabNavigator(
    {
        [Routes.Associations]: {
            screen: AssociationsScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Structure.title} />,
            },
        },

        [Routes.Areas]: {
            screen: AreasScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Structure.areas} />,
            },
        },

        [Routes.Clubs]: {
            screen: ClubsScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Structure.clubs} />,
            },
        },
    },
    {
        tabBarComponent: StructureScreen,
        initialRouteName: Routes.Associations,
        lazy: true,
        swipeEnabled: true,
        // animationEnabled: true,
        tabBarPosition: 'top',
        // optimizationsEnabled: true,
    },
);
