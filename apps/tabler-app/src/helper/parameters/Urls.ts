import { getConfigValue } from '../getConfigValue';

export type UrlParameters = {
    profile: string,
    world: string,
    world_whitelist: string[],
    feedback: string,
    join: string,

    support: {
        global: string,
        [key: string]: string,
    },

    imprint: {
        en: string,
        [key: string]: string,
    },

    dataprotection: {
        en: string,
        [key: string]: string,
    },
};

export const UrlDefaults: UrlParameters = {
    profile: getConfigValue('profile'),

    world: getConfigValue('world'),
    world_whitelist: getConfigValue('world_whitelist'),

    feedback: getConfigValue('feedback'),
    join: getConfigValue('join'),

    support: getConfigValue('support'),

    imprint: getConfigValue('imprint'),
    dataprotection: getConfigValue('dataprotection'),
};
