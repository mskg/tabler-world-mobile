import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { I18N } from '../i18n/translation';
import { AlbumsScreen } from '../screens/Albums';
import { MembersScreen } from '../screens/Members';
import MoreScreen from '../screens/More';
import { NewsScreen } from '../screens/News';
import StructureScreen from '../screens/Structure';
import { WorldScreen } from '../screens/World';
import { MainRoutes } from './Routes';

export const MainNavRoutes = {
    [MainRoutes.Members]: {
        screen: MembersScreen,
        navigationOptions: {
            tabBarLabel: I18N.Members.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-body" />),
        },
    },

    [MainRoutes.Structure]: {
        screen: StructureScreen,
        navigationOptions: {
            tabBarLabel: I18N.Structure.navigation,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-book" />),
        },
        params: {
            association: null,
            associationName: null,
        },
    },

    [MainRoutes.News]: {
        screen: NewsScreen,
        navigationOptions: {
            tabBarLabel: I18N.News.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-paper" />),
        },
    },

    [MainRoutes.Albums]: {
        screen: AlbumsScreen,
        navigationOptions: {
            tabBarLabel: I18N.Albums.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-image" />),
        },
    },

    [MainRoutes.World]: {
        screen: WorldScreen,
        navigationOptions: {
            tabBarLabel: I18N.World.tab,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-globe" />),
        },
    },

    [MainRoutes.More]: {
        screen: MoreScreen,
        navigationOptions: {
            tabBarLabel: I18N.Menu.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-menu" />),
        },
    },
};
