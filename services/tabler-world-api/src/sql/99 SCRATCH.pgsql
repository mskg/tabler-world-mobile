SET ROLE 'tw_read_dev';


select p.firstname, p.lastname, u.*
from
    usersettings u, profiles p
where
    tokens is null
and u.id = p.id


select count(*)
from usersettings
where settings->>'nearbymembers' = 'true'

select count(distinct id)
from userlocations_history


select distinct id
from userlocations_history
where id not in (
    select id
    from usersettings
    where settings->>'nearbymembers' = 'true'
)

select
    h.id,
    p.lastname,
    lastseen,

    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude,

    cast(
        EXTRACT(EPOCH FROM (lastseen - (lag(lastseen) over client_window)))
        as integer
    ) as durations,

    cast(
        EXTRACT(EPOCH FROM (lastseen - (lag(lastseen) over client_window))) / 60
        as integer
    ) as duration,


    cast(ST_Distance(
        lag(point) over client_window,
        point
    ) as integer) AS distance,

    cast(accuracy as integer) as accuracy,


    speed,


    h.address->>'street' as street,
    h.address->>'city' as city

from
    userlocations_history h, profiles p
where
    h.id = p.id
    and h.id = 10430
WINDOW client_window as (partition by h.id order by lastseen)
order by lastseen desc


delete from userlocations
where id = 10430


select firstname, lastname, *
from profiles where id = 9046


select * from
userlocations_history
where id = 9046
order by lastseen desc
