import { formatNumber } from './helper/formatNumber';
import { AnyOperationMode } from './types/AnyOperationMode';
import { AnyRecordType } from './types/AnyRecordType';
import { OperationMode } from './types/OperationMode';
import { RecordType } from './types/RecordType';

type configType = {
    [key in AnyRecordType]: {
        [key in AnyOperationMode]: {
            url: string,
            method: "GET" | "POST",
            payload: () => undefined | any
        }
    }
};

export const CONFIGURATIONS: configType = {
    [RecordType.clubs]: {
        [OperationMode.full]: {
            url: `/v1/admin/levels/clubs/?`,
            method: "GET",
            payload: () => undefined,
        },

        [OperationMode.incremental]: {
            url: `/v1/admin/levels/clubs/?`,
            method: "GET",
            payload: () => undefined,
        },
    },

    [RecordType.tabler]: {
        [OperationMode.full]: {
            url: `/v1/admin/contacts/?`,
            method: "GET",
            payload: () => undefined,
        },

        [OperationMode.incremental]: {
            url: `/v1/admin/contacts/search/?`,
            method: "POST",
            payload: () => {
                const date = new Date();
                return JSON.stringify({
                    "operator": "AND",
                    "last_modified": `${date.getFullYear()}-${formatNumber(date.getMonth())}-${formatNumber(date.getDate())}`,
                });
            }
        }
    }
};
