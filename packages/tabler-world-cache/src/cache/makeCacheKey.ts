
type CacheTypes =
    | 'Members'
    | 'Member'

    | 'Structure'

    | 'Club'
    | 'Area'
    | 'Association'

    | 'Family'
    ;

export function makeCacheKey(type: CacheTypes, ids: (string | number)[]) {
    return `tw::${type}::${ids.join(':')}`;
}
