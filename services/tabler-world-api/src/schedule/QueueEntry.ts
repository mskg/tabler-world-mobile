
export type QueueEntry =
    | {
        type: "member",
        id: number,
    }
    | {
        type: "club",
        id: string,
    }
;