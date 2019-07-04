
type CacheTypes =
    | "Member"
    | "Structure"
    | "Members"
;

export function makeCacheKey (type: CacheTypes, ids: (string | number)[]) {
    return `tw::${type}::${ids.join(":")}`;
}