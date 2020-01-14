import { AnyJobType } from './AnyJobType';
import { AnyOperationMode } from './AnyOperationMode';

export type ImportEvent = {
    type: AnyJobType;
    mode: AnyOperationMode;

    maxRecords?: number;
    offset?: number;

    noRefreshViews?: boolean;
    noUpdateCache?: boolean;
};
