import { NavigationActions } from 'react-navigation';
import { I18N } from '../../i18n/translation';
import { Routes } from '../../navigation/Routes';

export interface IProfileParams {
    tabler: number,
}

export interface IClubParams {
    club: string,
}

export interface IPictureParams {
    title: string,
    picture: string,
}

export const showProfile = (tablerId: number) => NavigationActions.navigate({
    routeName: Routes.Contact,
    key: "tabler:"+tablerId.toString(),
    params: {
        tabler: tablerId
    } as IProfileParams,
});

export const showPictureSceen = (pic: string, title?: string) => NavigationActions.navigate({
    routeName: Routes.Picture,
    params: {
        picture: pic,
        title: title || I18N.Image.Member
    }
});

export const homeScreen = () => NavigationActions.navigate({
    routeName: Routes.Home,
});

export const showSearch = () => NavigationActions.navigate({
    routeName: Routes.Search
});

export const showFilter = () => NavigationActions.navigate({
    routeName: Routes.Filter
});

export const showClub = (id: string) => NavigationActions.navigate({
    routeName: Routes.Club,
    key: "club:"+id,
    params: {
        club: id
    } as IClubParams,
});