import { SupportedLanguages } from "./types/SupportedLangs";

export const Message = {
    lang: (str: SupportedLanguages): (typeof Strings.en) => {
        return (Strings[str] || Strings.en);
    },
};

const Strings = {
    de: {
        title: "Geburtstagserinnerung",
        text: (n: any) => `Hilf ${n} einen großartigen Tag zu erleben!`,
    },

    en: {
        title: "Birthday time",
        text: (n: any) => `Help ${n} to have a great day!`,
    },
};