
type CacheTypes =
    | "Members"
    | "Member"

    | "Structure"

    | "Club"
    | "Area"
    | "Association"
;

export function makeCacheKey(type: CacheTypes, ids: (string | number)[]) {
    return `tw::${type}::${ids.join(":")}`;
}