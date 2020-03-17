
import { ChangePointer } from '../types/ChangePointer';
import { JobType } from '../types/JobType';

export type WorkflowResult = {
    processedRecords: number,
    modifications: ChangePointer[],
    totalRecords: number,
};

export type Workflow = (
    type: JobType,
    url: string, method: string, postData: any,
    limit: number,
    offset?: number,
    maxRecords?: number,
) => Promise<WorkflowResult>;
