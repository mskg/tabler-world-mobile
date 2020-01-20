import { createStackNavigator } from 'react-navigation-stack';
import { LegalScreen } from './Legal';
import { MainSettingsScreen } from './Main';
import { Routes } from './Routes';
import { ShowExternalScreen } from './ShowExternalScreen';
import { ShowMDScreen } from './ShowMDScreen';
import { NotificationsSettingsScreen } from './Notifications';

const Navigator = createStackNavigator(
    {
        [Routes.Main]: { screen: MainSettingsScreen },
        [Routes.Legal]: { screen: LegalScreen },
        [Routes.MD]: { screen: ShowMDScreen },
        [Routes.External]: { screen: ShowExternalScreen },
        [Routes.Notifications]: { screen: NotificationsSettingsScreen },
    },
    {
        initialRouteName: Routes.Main,
        headerMode: 'none',
    },
);

export default Navigator;
