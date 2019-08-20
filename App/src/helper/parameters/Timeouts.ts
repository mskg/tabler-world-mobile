
export const MS_PER_MINUTE = 60000;
const hours = (hours: number) => 60 * hours * MS_PER_MINUTE;

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
}

export const TimeoutDefaults: TimeoutParameters = {
    albums: hours(4),
    album: hours(4),

    members: hours(12),
    member: hours(12),

    associations: hours(24),
    areas: hours(24),

    clubs: hours(24),
    club: hours(24),

    utility: hours(4),
    news: hours(4),
    newsarticle: hours(4),

    userroles: hours(24*7),
};