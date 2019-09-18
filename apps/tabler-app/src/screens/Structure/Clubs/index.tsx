import { createStackNavigator } from 'react-navigation';
import { ClubsListScreen } from './ClubsListScreen';
import { ClubsMapScreen } from './ClubsMapScreen';
import { Routes } from './Routes';

const Navigator = createStackNavigator(
    {
        [Routes.List]: { screen: ClubsListScreen },
        [Routes.Map]: { screen: ClubsMapScreen },
    },
    {
        initialRouteName: Routes.List,
        headerMode: 'none',
    },
);

// tslint:disable-next-line: export-name
export default Navigator;
