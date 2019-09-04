import { createStackNavigator } from 'react-navigation';
import { ClubsScreen } from './List';
import { ClubsMapScreen } from './Map';
import { Routes } from './Routes';

const Navigator = createStackNavigator(
    {
        [Routes.List]: { screen: ClubsScreen },
        [Routes.Map]: { screen: ClubsMapScreen },
    },
    {
        initialRouteName: Routes.List,
        headerMode: 'none',
    },
);

export default Navigator;
