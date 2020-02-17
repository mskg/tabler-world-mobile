import defaultLanguage from './translations/en';

export type I18NType = typeof defaultLanguage & {
    id: string,
    NavigationStyle: any,
};
