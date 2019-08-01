import React from 'react';
import { Animated } from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { createMaterialTopTabNavigator } from 'react-navigation';
import { I18N } from '../i18n/translation';
import { AreasScreen } from './Structure/Areas';
import { AssociationsScreen } from './Structure/Associations';
import ClubsScreen from './Structure/Clubs';
import { Routes } from './Structure/Routes';
import { StructureScreen } from './Structure/Screen';

/**
 * MaterialTopTabBar does not allov customization of label container.
 * We override the numberOfLines here
 */
const LabelBase =
    ({ text, theme, color }) =>
        <Text
            numberOfLines={1}
            style={{ color, fontFamily: theme.fonts.medium, }}
        >
            {text.toUpperCase()}
        </Text>;

const Label = Animated.createAnimatedComponent(withTheme(LabelBase));

const Navigator = createMaterialTopTabNavigator(
    {
        [Routes.Associations]: {
            screen: AssociationsScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Structure.associations} />,
            }
        },
        [Routes.Areas]: {
            screen: AreasScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Structure.areas} />,
            }
        },

        [Routes.Clubs]: {
            screen: ClubsScreen,
            navigationOptions: {
                tabBarLabel: ({ tintColor }) => <Label color={tintColor} text={I18N.Structure.clubs} />,
            }
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
    }
);

export default Navigator;
