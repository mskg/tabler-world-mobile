import { UrlParameters } from '../types/Urls';

export const Urls: UrlParameters = {
    join: 'https://rtinternational.org/about-us/about-round-table/how-to-join/',

    support: {
        global: 'support@roundtable.world',
    },

    imprint: {
        en: 'https://tabler.app/en/legal-notice/',
    },

    dataprotection: {
        en: 'https://tabler.app/en/privacy-policy/',
    },

    translate: 'https://poeditor.com/join/project/yn5eIXR07r',
    translations: 'https://tabler-world-assets.s3-accelerate.amazonaws.com/translations/#channel#/#lang#.json',

    // tslint:disable-next-line: no-http-string
    feedback: 'http://feedback.app.roundtable.world/',

    profile: 'https://rti.roundtable.world/#lang#/members/#id#/',

    world: 'https://rti.roundtable.world/#lang#/',
    world_whitelist: [
        '*.roundtable.world',
    ],
};
