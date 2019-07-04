const HOUR = 60*60;

export const TTLs = {
    MemberOverview: HOUR * 2,
    Member: HOUR * 4,
    Structure: HOUR * 24,
    Albums: HOUR * 4,

    // some overlap here
    Memory: HOUR * 1,
    Default: HOUR * 24 * 2,
};
