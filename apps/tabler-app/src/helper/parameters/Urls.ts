import { getConfigValue } from '../getConfigValue';

export type UrlParameters = {
    profile: string,
    world: string,
    world_whitelist: string[],
    feedback: string,
    join: string,
    support: string,
};

export const UrlDefaults: UrlParameters = {
    profile: getConfigValue('profile'),

    world: getConfigValue('world'),
    world_whitelist: getConfigValue('world_whitelist'),

    feedback: getConfigValue('feedback'),
    join: getConfigValue('join'),
    support: getConfigValue('support'),
};
