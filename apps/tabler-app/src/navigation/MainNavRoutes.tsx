import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Badge, Text } from 'react-native-paper';
import { connect } from 'react-redux';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { ConversationsScreen } from '../screens/Conversations';
import { MembersScreen } from '../screens/Members';
import MoreScreen from '../screens/More';
import { NearbyScreen } from '../screens/Nearby';
import StructureScreen from '../screens/Structure';
import { MainRoutes } from './MainRoutes';

const IconWithBadgeBase = ({ tintColor, badge }) => (
    <View style={{ flexDirection: 'row' }}>
        <Ionicons size={24} color={tintColor} name="md-chatbubbles" />
        {badge > 0 && <Badge size={10} style={{ marginBottom: 15, marginLeft: -5 }} />}
    </View>
);

const IconWithBadge = connect((s: IAppState) => ({ badge: s.chat.badge }))(IconWithBadgeBase);

export const MainNavRoutes = {
    [MainRoutes.Members]: {
        screen: MembersScreen,
        navigationOptions: {
            tabBarLabel: () => I18N.Screen_Members.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-body" />),
        },
    },

    [MainRoutes.Structure]: {
        screen: StructureScreen,
        navigationOptions: {
            tabBarLabel: () => I18N.Screen_Structure.navigation,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-book" />),
        },
    },

    [MainRoutes.Conversations]: {
        screen: ConversationsScreen,
        navigationOptions: {
            tabBarLabel: () => I18N.Screen_Conversations.title,
            tabBarIcon: ({ tintColor }) => <IconWithBadge tintColor={tintColor} />,
        },
    },

    [MainRoutes.NearBy]: {
        screen: NearbyScreen,
        navigationOptions: {
            tabBarLabel: () => I18N.Screen_NearbyMembers.navigation,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-navigate" />),
        },
    },

    [MainRoutes.More]: {
        screen: MoreScreen,
        navigationOptions: {
            tabBarLabel: () => I18N.Screen_Menu.title,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-menu" />),
        },
    },
};
