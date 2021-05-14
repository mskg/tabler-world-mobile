import { AnyJobType } from './AnyJobType';
import { AnyOperationMode } from './AnyOperationMode';
import { TargetTypes } from './TargetType';

export type ImportEvent = {
    target: TargetTypes,

    type: AnyJobType;
    mode: AnyOperationMode;

    maxRecords?: number;
    offset?: number;

    noRefreshViews?: boolean;
    noUpdateCache?: boolean;
};
