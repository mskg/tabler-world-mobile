
export type CacheUpdateQueueEntry =
    | {
        type: "member",
        id: number,
    }
    | {
        type: "club",
        id: string,
    }
;