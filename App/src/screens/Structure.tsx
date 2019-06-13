import { createMaterialTopTabNavigator } from 'react-navigation';
import { I18N } from '../i18n/translation';
import { AreasScreen } from './Structure/Areas';
import { AssociationsScreen } from './Structure/Associations';
import { ClubsScreen } from './Structure/Clubs';
import { Routes } from './Structure/Routes';
import { StructureScreen } from './Structure/Screen';

const Navigator = createMaterialTopTabNavigator(
    {
        [Routes.Associations]: {
            screen: AssociationsScreen,
            navigationOptions: {
                title: I18N.Structure.associations,
            }
        },
        [Routes.Areas]: {
            screen: AreasScreen,
            navigationOptions: {
                title: I18N.Structure.areas,
            }
        },

        [Routes.Clubs]: {
            screen: ClubsScreen,
            navigationOptions: {
                title: I18N.Structure.clubs,
            }
        },
    },
    {
        tabBarComponent: StructureScreen,
        initialRouteName: Routes.Associations,
        lazy: true,
        swipeEnabled: true,
        // animationEnabled: true,
        tabBarPosition: 'top',
        // optimizationsEnabled: true,
    }
);

export default Navigator;
