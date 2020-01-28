import { NavigationActions } from 'react-navigation';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { I18N } from '../../i18n/translation';
import { AssociationName } from '../../model/graphql/AssociationName';
import { HomeRoutes } from '../../navigation/Routes';
import { GetAssociationNameQuery } from '../../queries/Structure/GetAssociationNameQuery';
import { Routes as MoreRoutes } from '../../screens/More/Routes';
import { Routes } from '../../screens/More/Settings/Routes';
import { Routes as StructureRoutes } from '../../screens/Structure/Routes';

export interface IProfileParams {
    tabler: number;
}

export interface IClubParams {
    club: string;
}

export interface INewsArticleParams {
    id: number;
}

export interface IAlbumParams {
    album: number;
}

export interface IPictureParams {
    title: string;
    picture: string;
}

export interface IConversationParams {
    id?: string;
    title?: string;
    member?: number;
}

export const showProfile = (tablerId: number) => NavigationActions.navigate({
    routeName: HomeRoutes.Member,
    key: `${HomeRoutes.Member}:${tablerId}`,
    params: {
        tabler: tablerId,
    } as IProfileParams,
});

export const showPictureSceen = (pic: string, title?: string) => NavigationActions.navigate({
    routeName: HomeRoutes.Picture,
    params: {
        picture: pic,
        title: title || I18N.Image.Member,
    },
});

export const homeScreen = () => NavigationActions.navigate({
    routeName: HomeRoutes.Home,
});

export const showSearch = () => NavigationActions.navigate({
    routeName: HomeRoutes.Search,
});

export const showFilter = () => NavigationActions.navigate({
    routeName: HomeRoutes.Filter,
});

export const showPair = () => NavigationActions.navigate({
    routeName: HomeRoutes.Pair,
});

export const showSettings = () => NavigationActions.navigate({
    routeName: Routes.Main,
    key: Routes.Main,
});

export const showNearbySettings = () => NavigationActions.navigate({
    routeName: MoreRoutes.NearbySettings,
    key: MoreRoutes.NearbySettings,
});

export const showNotificationSettings = () => NavigationActions.navigate({
    routeName: Routes.Notifications,
    key: Routes.Notifications,
});

export const showLocationHistory = () => NavigationActions.navigate({
    routeName: MoreRoutes.LocationHistory,
    key: MoreRoutes.LocationHistory,
});

export const showClub = (id: string) => NavigationActions.navigate({
    routeName: HomeRoutes.Club,
    key: `${HomeRoutes.Club}:${id}`,
    params: {
        club: id,
    } as IClubParams,
});

export const showAlbum = (id: number) => NavigationActions.navigate({
    routeName: HomeRoutes.Album,
    key: `${HomeRoutes.Album}:${id}`,
    params: {
        album: id,
    } as IAlbumParams,
});

export const showNewsArticle = (id: number) => NavigationActions.navigate({
    routeName: HomeRoutes.NewsArticle,
    key: `${HomeRoutes.NewsArticle}:${id}`,
    params: {
        id,
    } as INewsArticleParams,
});

export const searchConversationPartner = () => NavigationActions.navigate({
    key: HomeRoutes.SearchConversationPartner,
    routeName: HomeRoutes.SearchConversationPartner,
});

export const showConversation = (id: string, title?: string) => NavigationActions.navigate({
    routeName: HomeRoutes.Conversation,
    key: `${HomeRoutes.Conversation}:${id}`,
    params: {
        id,
        title,
    } as IConversationParams,
});

export const startConversation = (id: number, title: string) => NavigationActions.navigate({
    routeName: HomeRoutes.StartConversation,
    key: HomeRoutes.StartConversation,
    params: {
        title,
        member: id,
    } as IConversationParams,
});

export const showAssociation = (id: string, name: string) => NavigationActions.navigate({
    routeName: HomeRoutes.Structure,
    key: `${HomeRoutes.Structure}:${id}`,
    params: {
        association: id,
        associationName: name,
    },
});

export const showArea = (id: string) => {
    let assoc = id;
    let name: string | undefined;

    if (id.indexOf('_') > 0) {
        // prefix is always 4 charactes long
        assoc = id.substr(0, id.indexOf('_', 4));

        try {
            const client = cachedAolloClient();
            const result = client.readQuery<AssociationName>({
                query: GetAssociationNameQuery,
                variables: {
                    id: assoc,
                },
            });

            name = result?.Association?.name;
        } catch { }
    }

    return NavigationActions.navigate({
        routeName: HomeRoutes.Structure,
        key: `${HomeRoutes.Structure}:${id}`,
        params: {
            association: assoc,
            associationName: name,
        },
        action: {
            type: 'Navigation/NAVIGATE',
            routeName: StructureRoutes.Areas,
            params: {
                id,
            },
        },
    });
};

export const showStructureSearch = () => NavigationActions.navigate({
    routeName: HomeRoutes.SearchStructure,
});

export const showFeedback = () => NavigationActions.navigate({
    routeName: MoreRoutes.Feedback,
});

