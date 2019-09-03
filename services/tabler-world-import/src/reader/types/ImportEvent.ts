import { AnyOperationMode } from "./AnyOperationMode";
import { AnyRecordType } from "./AnyRecordType";

export type ImportEvent = {
    type: AnyRecordType;
    mode: AnyOperationMode;
};
