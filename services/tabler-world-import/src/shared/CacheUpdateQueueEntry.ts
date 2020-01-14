import { RecordType } from './RecordType';

export type CacheUpdateQueueEntry =
    | {
        type: RecordType.member,
        id: number,
    }
    | {
        type: RecordType.club,
        id: string,
    }
    | {
        type: RecordType.area,
        id: string,
    }
    | {
        type: RecordType.association,
        id: string,
    }
    | {
        type: RecordType.family,
        id: string,
    };
