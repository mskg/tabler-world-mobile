import { formatNumber } from './helper/formatNumber';
import { AnyJobType } from './types/AnyJobType';
import { AnyOperationMode } from './types/AnyOperationMode';
import { JobType } from './types/JobType';
import { OperationMode } from './types/OperationMode';

type configType = {
    [key in AnyJobType]: {
        // tslint:disable-next-line: no-shadowed-variable
        [key in AnyOperationMode]: {
            url: string,
            method: 'GET' | 'POST',
            payload: () => undefined | any,
        }
    }
};

// tslint:disable-next-line: export-name
export const CONFIGURATIONS: configType = {
    [JobType.clubs]: {
        [OperationMode.full]: {
            url: `/v1/admin/levels/all/?`,
            method: 'GET',
            payload: () => undefined,
        },

        [OperationMode.incremental]: {
            url: `/v1/admin/levels/all/?`,
            method: 'GET',
            payload: () => undefined,
        },
    },

    [JobType.groups]: {
        [OperationMode.full]: {
            url: `/v1/admin/groups/?`,
            method: 'GET',
            payload: () => undefined,
        },

        [OperationMode.incremental]: {
            url: `/v1/admin/groups/?`,
            method: 'GET',
            payload: () => undefined,
        },
    },

    [JobType.tabler]: {
        [OperationMode.full]: {
            url: `/v1/admin/contacts/?`,
            method: 'GET',
            payload: () => undefined,
        },

        [OperationMode.incremental]: {
            url: `/v1/admin/contacts/search/?`,
            method: 'POST',
            payload: () => {
                const date = new Date();
                return JSON.stringify({
                    operator: 'AND',
                    last_modified: `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())}`,
                });
            },
        },
    },
};
