
export type QueueEntry =
    | {
        type: "member",
        id: string | number,
    }
    | {
        type: "clubs",
    }
;