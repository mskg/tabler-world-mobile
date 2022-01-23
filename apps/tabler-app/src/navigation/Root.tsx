import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { AlbumScreen } from '../screens/Album';
import { ClubScreen } from '../screens/Club';
import { ConversationScreen } from '../screens/Conversation/ConversationScreen';
import { FamiliesScreen } from '../screens/Families';
import { FilterScreen } from '../screens/Filter';
import { LocationHistoryScreen } from '../screens/LocationHistory';
import { MemberScreen } from '../screens/Member';
import { NearbySettingsScreen } from '../screens/More/Settings/Nearby';
import { NewsArticleScreen } from '../screens/NewsArticle';
import PairScreen from '../screens/Pair';
import { PictureScreen } from '../screens/Picture';
import { SearchScreen } from '../screens/Search';
import { SearchConversationPartnerScreen } from '../screens/Search/SearchConversationPartnerScreen';
import { SearchStructureScreen } from '../screens/SearchStructure';
import StructureScreen from '../screens/Structure';
import { HomeRoutes } from './HomeRoutes';
import { MainBottomNavigation } from './MainBottomNavigation';

const Navigator = createAppContainer(createStackNavigator(
    {
        [HomeRoutes.Home]: { screen: MainBottomNavigation },
        [HomeRoutes.Member]: { screen: MemberScreen },
        [HomeRoutes.Search]: { screen: SearchScreen },
        [HomeRoutes.Filter]: { screen: FilterScreen },
        [HomeRoutes.Club]: { screen: ClubScreen },
        [HomeRoutes.Picture]: { screen: PictureScreen },
        [HomeRoutes.Album]: { screen: AlbumScreen },
        [HomeRoutes.NewsArticle]: { screen: NewsArticleScreen },
        [HomeRoutes.Pair]: { screen: PairScreen },
        [HomeRoutes.Conversation]: { screen: ConversationScreen },
        [HomeRoutes.SearchConversationPartner]: { screen: SearchConversationPartnerScreen },
        [HomeRoutes.Structure]: { screen: StructureScreen },
        [HomeRoutes.SearchStructure]: { screen: SearchStructureScreen },
        [HomeRoutes.NearbySettings]: { screen: NearbySettingsScreen },
        [HomeRoutes.LocationHistory]: { screen: LocationHistoryScreen },
        [HomeRoutes.Families]: { screen: FamiliesScreen },
    },
    {
        initialRouteName: HomeRoutes.Home,
        headerMode: 'none',
        disableKeyboardHandling: true,
    },
));

export default Navigator;
