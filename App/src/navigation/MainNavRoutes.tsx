import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { I18N } from '../i18n/translation';
import { AlbumsScreen } from '../screens/Albums';
import { MembersScreen } from '../screens/Members';
import SettingsScreen from '../screens/Settings';
import StructureScreen from '../screens/Structure';
import { WorldScreen } from '../screens/World';
import { MainRoutes } from './Routes';

export const MainNavRoutes = {
    [MainRoutes.Members]: {
        screen: MembersScreen,
        navigationOptions: {
            tabBarLabel: I18N.Members.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-body" />)
        }
    },

    [MainRoutes.Structure]: {
        screen: StructureScreen,
        navigationOptions: {
            tabBarLabel: I18N.Structure.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-book" />)
        }
    },

    [MainRoutes.World]: {
        screen: WorldScreen,
        navigationOptions: {
            tabBarLabel: I18N.World.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-globe" />),
        }
    },

    [MainRoutes.Albums]: {
        screen: AlbumsScreen,
        navigationOptions: {
            tabBarLabel: I18N.Albums.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-albums" />)
        }
    },

    [MainRoutes.Settings]: {
        screen: SettingsScreen,
        navigationOptions: {
            tabBarLabel: I18N.Settings.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-settings" />)
        }
    },
};
