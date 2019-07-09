const HOUR = 60*60;
const hours = (hours: number) => hours * HOUR;

export const TTLs = {
    MemberOverview: hours(2),
    Member: hours(4),
    Structure: hours(24),
    Albums: hours(4),

    // everything else
    Default: hours(24*2),

    // some overlap here
    Memory: hours(1),
};
