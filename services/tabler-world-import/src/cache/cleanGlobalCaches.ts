import { makeCacheKey } from '@mskg/tabler-world-cache';
import { cacheInstance } from './cacheInstance';

export async function cleanGlobalCaches(record: any) {
    // member could have been board
    const areaKey = makeCacheKey('Area', [record.area]);
    console.log('Removing', areaKey);
    await cacheInstance.delete(areaKey);

    const associationKey = makeCacheKey('Association', [record.association]);
    console.log('Removing', associationKey);
    await cacheInstance.delete(associationKey);

    const familyKey = makeCacheKey('Family', [record.family]);
    console.log('Removing', familyKey);
    await cacheInstance.delete(familyKey);

    // Read caches
    const allAreas = makeCacheKey('Structure', [record.association, 'areas', 'all']);
    console.log('Removing', allAreas);
    await cacheInstance.delete(allAreas);

    const allClubs = makeCacheKey('Structure', [record.association, 'clubs', 'all']);
    console.log('Removing', allClubs);
    await cacheInstance.delete(allClubs);

    const allFamilies = makeCacheKey('Structure', ['families', 'all']);
    console.log('Removing', allFamilies);
    await cacheInstance.delete(allFamilies);

    const allAssociations = makeCacheKey('Structure', ['associations', 'all']);
    console.log('Removing', allAssociations);
    await cacheInstance.delete(allAssociations);
}
