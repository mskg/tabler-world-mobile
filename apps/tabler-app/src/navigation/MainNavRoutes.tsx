import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { I18N } from '../i18n/translation';
import { ConversationsScreen } from '../screens/Conversations';
import { MembersScreen } from '../screens/Members';
import MoreScreen from '../screens/More';
import { NearbyScreen } from '../screens/Nearby';
import StructureScreen from '../screens/Structure';
import { MainRoutes } from './MainRoutes';
import { Badge } from 'react-native-paper';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { IAppState } from '../model/IAppState';

const IconWithBadgeBase = ({ tintColor, badge }) => (
    <View style={{ flexDirection: 'row' }}>
        <Ionicons size={24} color={tintColor} name="md-chatboxes" />
        {badge > 0 && <Badge size={14} style={{ marginBottom: 15, marginLeft: -5 }} />}
    </View>
);

const IconWithBadge = connect((s: IAppState) => ({ badge: s.chat.badge }))(IconWithBadgeBase);

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
    },

    [MainRoutes.Conversations]: {
        screen: ConversationsScreen,
        navigationOptions: {
            tabBarLabel: I18N.Conversations.title,
            tabBarIcon: ({ tintColor }) => <IconWithBadge tintColor={tintColor} />,
        },
    },

    [MainRoutes.NearBy]: {
        screen: NearbyScreen,
        navigationOptions: {
            tabBarLabel: I18N.NearbyMembers.navigation,
            tabBarIcon: ({ tintColor }) => (<Ionicons size={24} color={tintColor} name="md-navigate" />),
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
