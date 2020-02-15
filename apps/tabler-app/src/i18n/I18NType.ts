import en from './translations/en';

export type I18NType = typeof en & {
    id: string,
    NavigationStyle: any,
};
