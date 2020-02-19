
export type UrlParameters = {
    profile: string,
    world: string,
    world_whitelist: string[],
    feedback: string,

    translate: string,
    translations: string,

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
