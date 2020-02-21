import { formatNumber } from './helper/formatNumber';
import { AnyJobType } from './types/AnyJobType';
import { AnyOperationMode } from './types/AnyOperationMode';
import { JobType } from './types/JobType';
import { OperationMode } from './types/OperationMode';
import { importWorkflow } from './workflows/importWorkflow';
import { removalWorkflow } from './workflows/removalWorkflow';
import { Workflow } from './workflows/workflowType';

type configType = {
    [type in AnyJobType]: {
        [operationMode in AnyOperationMode]: {
            defaultPagination: number,
            maxPagination: number,

            url: string,
            method: 'GET' | 'POST',
            payload: () => undefined | any,
            workflow: Workflow,
        }
    }
};

// tslint:disable-next-line: export-name
export const CONFIGURATIONS: configType = {
    [JobType.clubs]: {
        [OperationMode.full]: {
            defaultPagination: 10,
            maxPagination: 25,

            url: `/v1/admin/levels/all/?`,
            method: 'GET',
            payload: () => undefined,
            workflow: importWorkflow,
        },

        [OperationMode.incremental]: {
            defaultPagination: 10,
            maxPagination: 25,

            url: `/v1/admin/levels/all/?`,
            method: 'GET',
            payload: () => undefined,
            workflow: importWorkflow,
        },
    },

    [JobType.structure]: {
        [OperationMode.full]: {
            defaultPagination: 10,
            maxPagination: 25,

            url: `/v1/admin/groups/?`,
            method: 'GET',
            payload: () => undefined,
            workflow: importWorkflow,
        },

        [OperationMode.incremental]: {
            defaultPagination: 10,
            maxPagination: 25,

            url: `/v1/admin/groups/?`,
            method: 'GET',
            payload: () => undefined,
            workflow: importWorkflow,
        },
    },

    [JobType.members]: {
        [OperationMode.full]: {
            defaultPagination: 10,
            maxPagination: 25,

            url: `/v1/admin/contacts/?`,
            method: 'GET',
            payload: () => undefined,
            workflow: importWorkflow,
        },

        [OperationMode.incremental]: {
            defaultPagination: 10,
            maxPagination: 25,

            url: `/v1/admin/contacts/search/?`,
            method: 'POST',
            workflow: importWorkflow,
            payload: () => {
                const date = new Date();

                return JSON.stringify({
                    operator: 'AND',
                    last_modified: `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())}`,
                });
            },
        },
    },

    [JobType.archivedMembers]: {
        [OperationMode.full]: {
            defaultPagination: 500,
            maxPagination: 500,

            url: `/v1/admin/contacts/archived/?`,
            method: 'POST',
            workflow: removalWorkflow,
            payload: () => '{}',
        },

        [OperationMode.incremental]: {
            defaultPagination: 500,
            maxPagination: 500,

            url: `/v1/admin/contacts/archived/?`,
            method: 'POST',
            workflow: removalWorkflow,
            payload: () => {
                const date = new Date();
                date.setDate(date.getDate() - 7); // 1 week back

                return JSON.stringify({
                    last_modified: `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())}`,
                });
            },
        },
    },
};
