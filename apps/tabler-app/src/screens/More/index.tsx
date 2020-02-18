import { createStackNavigator } from 'react-navigation-stack';
import { AlbumsScreen } from './Albums';
import { DevelopmentScreen } from './Developer';
import { FeedbackScreen } from './Feedback';
import { JobsHistoryScreen } from './JobHistory';
import { LocationHistoryScreen } from '../LocationHistory';
import { MenuScreen } from './Menu';
import { NewsScreen } from './News';
import { Routes } from './Routes';
import MainSettingsScreen from './Settings';
import { NearbySettingsScreen } from './Settings/Nearby';
import { WorldScreen } from './World';

const Navigator = createStackNavigator(
    {
        [Routes.Menu]: { screen: MenuScreen },
        [Routes.NearbySettings]: { screen: NearbySettingsScreen },
        [Routes.Settings]: { screen: MainSettingsScreen },
        [Routes.World]: { screen: WorldScreen },
        [Routes.Feedback]: { screen: FeedbackScreen },
        [Routes.JobHistory]: { screen: JobsHistoryScreen },

        [Routes.Albums]: { screen: AlbumsScreen },
        [Routes.News]: { screen: NewsScreen },
        [Routes.Developer]: { screen: DevelopmentScreen },
    },
    {
        initialRouteName: Routes.Menu,
        headerMode: 'none',
    },
);

export default Navigator;
