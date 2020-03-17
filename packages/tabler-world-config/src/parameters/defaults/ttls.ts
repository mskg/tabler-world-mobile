import { Param_TTLS } from '../types/Param_TTLS';

const HOUR = 60 * 60;
const hours = (h: number) => h * HOUR;
const days = (d: number) => hours(24 * d);

export const ttls = {
    MemberOverview: 0,
    StructureOverview: 0,

    Member: days(7),
    Structure: days(7),

    I18N: hours(24),

    Albums: hours(4),
    Documents: hours(4),
    News: hours(4),

    Principal: hours(1),

    ChatConversations: hours(1),
    ChatEnabled: hours(4),
    LocationEnabled: hours(8),
} as Param_TTLS;
