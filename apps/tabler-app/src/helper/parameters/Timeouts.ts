
export const MS_PER_MINUTE = 60000;
const hours = (h: number) => 60 * h * MS_PER_MINUTE;

export type TimeoutParameters = {
    albums: number,
    album: number,

    members: number,
    member: number,

    associations: number,
    areas: number,

    clubs: number,
    club: number,

    utility: number,
    news: number,
    newsarticle: number,

    userroles: number,
};

export const TimeoutDefaults: TimeoutParameters = {
    albums: hours(4),
    album: hours(4),

    members: hours(6),
    member: hours(6),

    associations: hours(12),
    areas: hours(12),
    clubs: hours(12),

    club: hours(6),

    utility: hours(4),
    news: hours(4),
    newsarticle: hours(4),

    userroles: hours(24 * 7),
};
