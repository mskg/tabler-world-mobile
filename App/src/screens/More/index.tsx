import { createStackNavigator } from 'react-navigation';
import { FeedbackScreen } from './Feedback';
import { MenuScreen } from './Menu';
import { NearbyScreen } from './Nearby';
import { Routes } from './Routes';
import MainSettingsScreen from './Settings';
import { WorldScreen } from './World';

const Navigator = createStackNavigator(
    {
        [Routes.Menu]: { screen: MenuScreen },
        [Routes.Nearby]: { screen: NearbyScreen },
        [Routes.Settings]: { screen: MainSettingsScreen },
        [Routes.World]: { screen: WorldScreen },
        [Routes.Feedback]: { screen: FeedbackScreen },
    },
    {
        initialRouteName: Routes.Menu,
        headerMode: 'none',
    }
);

export default Navigator;
