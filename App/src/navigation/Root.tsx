import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text } from "react-native-paper";
import { createAppContainer, createStackNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { I18N } from '../i18n/translation';
import { ClubScreen } from '../screens/Club';
import { FilterScreen } from '../screens/Filter';
import { MemberScreen } from '../screens/Member';
import { MembersScreen } from '../screens/Members';
import { PictureScreen } from '../screens/Picture';
import { SearchScreen } from '../screens/Search';
import SettingsScreen from '../screens/Settings';
import StructureScreen from '../screens/Structure';
import { WorldScreen } from '../screens/World';
import { ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT, ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR } from '../theme/colors';
import { Routes } from "./Routes";

const MainNavRoutes = {
    MembersScreen: {
        screen: MembersScreen,
        navigationOptions: {
            tabBarLabel: I18N.Members.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-body" />)
        }
    },

    StructureScreen: {
        screen: StructureScreen,
        navigationOptions: {
            tabBarLabel: I18N.Structure.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-book" />)
        }
    },

    WorldScreen: {
        screen: WorldScreen,
        navigationOptions: {
            tabBarLabel: I18N.World.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-globe" />)
        }
    },

    // PicturesScreen: {
    //     screen: PicturesScreen,
    //     navigationOptions: {
    //         tabBarLabel: I18N.Pictures.title,
    //         tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-albums" />)
    //     }
    // },

    SettingsScreen: {
        screen: SettingsScreen,
        navigationOptions: {
            tabBarLabel: I18N.Settings.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-settings" />)
        }
    },
}

const MainNavigation = createMaterialBottomTabNavigator(
    MainNavRoutes,
    {
        initialRouteName: 'MembersScreen',
        shifting: true,
        renderLabel: ({ color, route }) => {
            return (<Text style={{ ...I18N.NavigationStyle, color }}>{MainNavRoutes[route.routeName].navigationOptions.tabBarLabel}</Text>)
        },
        activeColor: ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT,
        barStyle: {
            backgroundColor: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR,
        }
    }
);

const Navigator = createAppContainer(createStackNavigator(
    {
        [Routes.Home]: { screen: MainNavigation },
        [Routes.Contact]: { screen: MemberScreen },
        [Routes.Search]: { screen: SearchScreen },
        [Routes.Filter]: { screen: FilterScreen },
        [Routes.Club]: { screen: ClubScreen },
        [Routes.Picture]: { screen: PictureScreen },
    },
    {
        initialRouteName: Routes.Home,
        headerMode: 'none',

    }
));

export default Navigator;
