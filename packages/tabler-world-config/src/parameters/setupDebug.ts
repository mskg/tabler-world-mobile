import LRU from 'lru-cache';
import { mapName } from './mapName';
import { Param_Api } from './types/Param_Api';
import { Param_Database } from './types/Param_Database';
import { Param_Nearby } from './types/Param_Nearby';
import { Param_Translations } from './types/Param_Translation';
import { Param_TTLS } from './types/Param_TTLS';

export function setupDebug(memoryCache: LRU<string, string>) {
    memoryCache.set(mapName('tw-api'), JSON.stringify({
        host: process.env.API_HOST,
        key: process.env.API_KEY_PLAIN,
        batch: parseInt(process.env.API_BATCH || '100', 10),
        read_batch: parseInt(process.env.API_READ_BATCH || '10', 10),
        concurrency: {
            read: parseInt(process.env.API_MAX_CONCURRENCY || '3', 10),
            write: parseInt(process.env.DB_MAX_CONCURRENCY || '3', 10),
        },
    } as Param_Api));

    memoryCache.set(mapName('database'), JSON.stringify({
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    } as Param_Database));

    memoryCache.set(mapName('nearby'), JSON.stringify({
        radius: parseInt(process.env.NEARBY_RADIUS || '100000', 10),
        days: parseInt(process.env.NEARBY_DAYSBACK || '365', 10),
    } as Param_Nearby));

    const HOUR = 60 * 60;
    const hours = (h: number) => h * HOUR;
    memoryCache.set(mapName('cachettl'), JSON.stringify({
        MemberOverview: hours(8),
        ClubMembers: hours(8),
        Member: 0,
        Structure: 0,
        StructureOverview: hours(24),
        Albums: hours(4),
        Documents: hours(4),
        News: hours(4),
        Principal: hours(1),
        I18N: hours(24),
    } as Param_TTLS));

    memoryCache.set(mapName('app'), JSON.stringify({
        urls: {
            feedback: 'https://www.google.de/search?q=feedback',
            profile: 'https://www.google.de/search?q=profile',
            world: 'https://www.google.de/search?q=world',
            join: 'https://www.google.de/search?q=join',
            support: 'no-reply@example.com',
        },
    }));

    memoryCache.set(mapName('app/ios'), JSON.stringify({
        urls: {
            feedback: 'https://www.google.de/search?q=feedback-ios',
            profile: 'https://www.google.de/search?q=profile-ios',
        },
    }));

    memoryCache.set(mapName('i18n'), JSON.stringify({
        poeditor: {
            host: process.env.POEEDITOR_HOST,
            id: process.env.POEEDITOR_ID,
            token: process.env.POEEDITOR_TOKEN,
        },
    } as Param_Translations));
}
