import { SupportedLanguages } from '../types/SupportedLangs';

// tslint:disable-next-line: variable-name
export const Message = {
    lang: (str: SupportedLanguages): (typeof strings.en) => {
        return (strings[str] || strings.en);
    },
};

const strings = {
    de: {
        title: 'Geburtstagserinnerung',
        text: (n: any) => `Hilf ${n} einen großartigen Tag zu erleben!`,
    },

    en: {
        title: 'Birthday time',
        text: (n: any) => `Help ${n} to have a great day!`,
    },

    nl: {
        title: 'Er is iemand jarig!',
        text: (n: any) => `Help me om ${n} een fantastische dag te bezorgen!`,
    },
};
