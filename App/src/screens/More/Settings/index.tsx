import { createStackNavigator } from 'react-navigation';
import { LegalScreen } from './Legal';
import { MainSettingsScreen } from './Main';
import { Routes } from './Routes';
import { ShowExternalScreen } from './ShowExternalScreen';
import { ShowMDScreen } from './ShowMDScreen';

const Navigator = createStackNavigator(
    {
        [Routes.Main]: { screen: MainSettingsScreen },
        [Routes.Legal]: { screen: LegalScreen },
        [Routes.MD]: { screen: ShowMDScreen },
        [Routes.External]: { screen: ShowExternalScreen },
    },
    {
        initialRouteName: Routes.Main,
        headerMode: 'none',
    }
);

export default Navigator;
