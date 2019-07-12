
export type QueueEntry =
    | {
        type: "member",
        id: string | number,
    }
    | {
        type: "club",
        id: string | number,
    }
;