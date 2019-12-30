import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { AlbumScreen } from '../screens/Album';
import { ClubScreen } from '../screens/Club';
import { ConversationScreen } from '../screens/Conversation/ConversationScreen';
import { FilterScreen } from '../screens/Filter';
import { MemberScreen } from '../screens/Member';
import { NewsArticleScreen } from '../screens/NewsArticle';
import PairScreen from '../screens/Pair';
import { PictureScreen } from '../screens/Picture';
import { SearchScreen } from '../screens/Search';
import { ExperimentsNavigator } from './ExperimentsNavigator';
import { HomeRoutes } from './Routes';
import { SearchConversationPartnerScreen } from '../screens/Search/SearchConversationPartnerScreen';
import { StartConversationScreen } from '../screens/Conversation/StartConversationScreen';

const Navigator = createAppContainer(createStackNavigator(
    {
        [HomeRoutes.Home]: { screen: ExperimentsNavigator },
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
        [HomeRoutes.StartConversation]: { screen: StartConversationScreen },
    },
    {
        initialRouteName: HomeRoutes.Home,
        headerMode: 'none',
        disableKeyboardHandling: true,
    },
));

export default Navigator;
