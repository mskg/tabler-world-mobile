import { createAppContainer, createStackNavigator } from 'react-navigation';
import { AlbumScreen } from '../screens/Album';
import { ClubScreen } from '../screens/Club';
import { FilterScreen } from '../screens/Filter';
import { MemberScreen } from '../screens/Member';
import { PictureScreen } from '../screens/Picture';
import { SearchScreen } from '../screens/Search';
import { ExperimentsNavigator } from './ExperimentsNavigator';
import { HomeRoutes } from "./Routes";

const Navigator = createAppContainer(createStackNavigator(
    {
        [HomeRoutes.Home]: { screen: ExperimentsNavigator },
        [HomeRoutes.Contact]: { screen: MemberScreen },
        [HomeRoutes.Search]: { screen: SearchScreen },
        [HomeRoutes.Filter]: { screen: FilterScreen },
        [HomeRoutes.Club]: { screen: ClubScreen },
        [HomeRoutes.Picture]: { screen: PictureScreen },
        [HomeRoutes.Album]: { screen: AlbumScreen },
    },
    {
        initialRouteName: HomeRoutes.Home,
        headerMode: 'none',

    }
));

export default Navigator;