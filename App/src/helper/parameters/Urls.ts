import { getConfigValue } from '../Configuration';

export type UrlParameters = {
    profile: string,
    world: string,
    feedback: string,
    join: string,
    support: string,
};

export const UrlDefaults: UrlParameters = {
    profile: getConfigValue('profile'),
    world: getConfigValue('world'),
    feedback: getConfigValue('feedback'),
    join: getConfigValue('join'),
    support: getConfigValue('support'),
};
