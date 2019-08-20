import { NavigationActions } from 'react-navigation';
import { I18N } from '../../i18n/translation';
import { HomeRoutes } from '../../navigation/Routes';
import { Routes as MoreRoutes } from '../../screens/More/Routes';
import { Routes } from '../../screens/More/Settings/Routes';

export interface IProfileParams {
    tabler: number,
}

export interface IClubParams {
    club: string,
}

export interface INewsArticleParams {
    id: number,
}

export interface IAlbumParams {
    album: number,
}

export interface IPictureParams {
    title: string,
    picture: string,
}

export const showProfile = (tablerId: number) => NavigationActions.navigate({
    routeName: HomeRoutes.Member,
    key: "tabler:"+tablerId.toString(),
    params: {
        tabler: tablerId
    } as IProfileParams,
});

export const showPictureSceen = (pic: string, title?: string) => NavigationActions.navigate({
    routeName: HomeRoutes.Picture,
    params: {
        picture: pic,
        title: title || I18N.Image.Member
    }
});

export const homeScreen = () => NavigationActions.navigate({
    routeName: HomeRoutes.Home,
});

export const showSearch = () => NavigationActions.navigate({
    routeName: HomeRoutes.Search
});

export const showFilter = () => NavigationActions.navigate({
    routeName: HomeRoutes.Filter
});

export const showPair = () => NavigationActions.navigate({
    routeName: HomeRoutes.Pair
});

export const showSettings = () => NavigationActions.navigate({
    routeName: Routes.Main,
});

export const showLocationHistory = () => NavigationActions.navigate({
    routeName: MoreRoutes.LocationHistory,
});

export const showClub = (id: string) => NavigationActions.navigate({
    routeName: HomeRoutes.Club,
    key: "club:"+id,
    params: {
        club: id
    } as IClubParams,
});

export const showAlbum = (id: number) => NavigationActions.navigate({
    routeName: HomeRoutes.Album,
    key: "album:"+id,
    params: {
        album: id
    } as IAlbumParams,
});

export const showNewsArticle = (id: number) => NavigationActions.navigate({
    routeName: HomeRoutes.NewsArticle,
    key: "newsarticle:"+id,
    params: {
        id
    } as INewsArticleParams,
});
