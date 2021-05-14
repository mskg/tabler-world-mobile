
import { ChangePointer } from '../types/ChangePointer';
import { JobType } from '../types/JobType';
import { TargetTypes } from '../types/TargetType';

export type WorkflowResult = {
    processedRecords: number,
    modifications: ChangePointer[],
    totalRecords: number,
};

export type Workflow = (
    type: JobType, target: TargetTypes,
    url: string, method: string, postData: any,
    limit: number,
    offset?: number,
    maxRecords?: number,
) => Promise<WorkflowResult>;
