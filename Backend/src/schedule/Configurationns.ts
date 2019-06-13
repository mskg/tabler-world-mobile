import { formatNumber } from './formatNumber';
import { Modes, Types } from './types';

export const CONFIGURATIONS = {
    [Types.clubs]: {
        [Modes.full]: {
            url: `/v1/admin/levels/clubs/?limit=${process.env.api_pagesize}`,
            method: "GET",
            payload: () => undefined,
        },
        [Modes.incremental]: {
            url: `/v1/admin/levels/clubs/?limit=${process.env.api_pagesize}`,
            method: "GET",
            payload: () => undefined,
        },
    },

    [Types.tabler]: {
        [Modes.full]: {
            url: `/v1/admin/contacts/?limit=${process.env.api_pagesize}`,
            method: "GET",
            payload: () => undefined,
        },
        [Modes.incremental]: {
            url: `/v1/admin/contacts/search/?limit=${process.env.api_pagesize}`,
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
