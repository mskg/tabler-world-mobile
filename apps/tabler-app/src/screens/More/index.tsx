import { createStackNavigator } from 'react-navigation-stack';
import { FeedbackScreen } from './Feedback';
import { JobsHistoryScreen } from './JobHistory';
import { LocationHistoryScreen } from './LocationHistory';
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
        [Routes.LocationHistory]: { screen: LocationHistoryScreen },
        [Routes.JobHistory]: { screen: JobsHistoryScreen },
    },
    {
        initialRouteName: Routes.Menu,
        headerMode: 'none',
    },
);

export default Navigator;
