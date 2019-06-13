import { createStackNavigator } from 'react-navigation';
import { LegalScreen } from './Settings/Legal';
import { MainSettingsScreen } from './Settings/Main';
import { ShowMDScreen } from './Settings/ShowMDScreen';
import { ShowExternalScreen } from './Settings/ShowExternalScreen';
import { Routes } from './Settings/Routes';

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
