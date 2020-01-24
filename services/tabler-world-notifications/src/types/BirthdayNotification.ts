import { SupportedLanguages } from './SupportedLangs';

export type BirthdayNotification = {
    userid: number;
    rtemail: string;
    tokens: string[];
    bid: number;
    firstname: string;
    lastname: string;
    lang: SupportedLanguages;
};
