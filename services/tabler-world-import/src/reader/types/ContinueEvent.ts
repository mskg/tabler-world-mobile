import { ChangePointer } from './ChangePointer';
import { ImportEvent } from './ImportEvent';

export type ContinueEvent = {
    type: 'continue';
    event: ImportEvent;
    changes: ChangePointer[];
    log: {
        calls: number;
        records: number;
        elapsedTime: number;
    };
};

export type CompressedContinueEvent = {
    type: 'c';
    d: string
};
