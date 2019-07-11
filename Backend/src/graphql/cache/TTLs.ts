const HOUR = 60*60;
const hours = (hours: number) => hours * HOUR;

export const TTLs = {
    MemberOverview: hours(8),   // base details don't change often
    ClubMembers:    hours(8),   // base details don't change often

    Member: 0,                  // updated by cache
    Structure: 0,               // removed by cache maintenance

    Albums: hours(4),

    // everything else e.g.
    Default: hours(24*2),

    // some overlap here
    Memory: hours(1),
};
