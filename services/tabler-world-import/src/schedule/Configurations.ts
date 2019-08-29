import { formatNumber } from './formatNumber';
import { Modes, Types } from './types';

export const CONFIGURATIONS = {
    [Types.clubs]: {
        [Modes.full]: {
            url: `/v1/admin/levels/clubs/?`,
            method: "GET",
            payload: () => undefined,
        },
        [Modes.incremental]: {
            url: `/v1/admin/levels/clubs/?`,
            method: "GET",
            payload: () => undefined,
        },
    },

    [Types.tabler]: {
        [Modes.full]: {
            url: `/v1/admin/contacts/?`,
            method: "GET",
            payload: () => undefined,
        },
        [Modes.incremental]: {
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
