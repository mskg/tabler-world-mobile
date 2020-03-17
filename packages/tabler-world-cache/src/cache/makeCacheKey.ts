
type CacheTypes =
    | 'Members'
    | 'Member'

    | 'Structure'

    | 'Club'
    | 'Area'
    | 'Association'

    | 'Family'

    | 'Resource'
    | 'Principal'

    | 'Conversation'
    ;

export function makeCacheKey(type: CacheTypes, ids: (string | number)[]) {
    return `${type.toLowerCase()}:${ids.join(':')}`;
}
