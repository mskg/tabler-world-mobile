import { AnyJobType } from './AnyJobType';
import { AnyOperationMode } from './AnyOperationMode';
import { TargetType } from './TargetType';

export type ImportEvent = {
    target: TargetType,

    type: AnyJobType;
    mode: AnyOperationMode;

    maxRecords?: number;
    offset?: number;

    noRefreshViews?: boolean;
    noUpdateCache?: boolean;
};
