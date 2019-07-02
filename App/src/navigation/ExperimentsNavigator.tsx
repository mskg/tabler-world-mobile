import { createSwitchNavigator } from 'react-navigation';
import { ExperimentsNavigation } from './ExperimentsNavigation';
import { LoadingScreen } from './LoadingScreenBase';
import { MainBottomNavigation } from './MainBottomNavigation';

export const ExperimentsNavigator = createSwitchNavigator(
    {
        Loading: LoadingScreen,
        Normal: MainBottomNavigation,
        Experiments: ExperimentsNavigation,
    }, {
        initialRouteName: 'Loading',
    }
);
