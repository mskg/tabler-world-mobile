SET ROLE tw_read_dev;


select count(*)
from usersettings

select area, club, count(*)
from
    profiles, usersettings
where
    profiles.id = usersettings.id
and association = 'rti_is'
group by area, club
order by 3


select area, club, count(*)
from
    profiles, usersettings
where
    profiles.id = usersettings.id
and association = 'rti_is'
group by area, club
order by 3


BEGIN;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_groups;

-- dependent on groups
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles;

-- dependent on groups, and roles
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings;

-- dependent data
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_families;

-- indexes
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_search;
COMMIT;



PREPARE a3ba714a222c649d6859c6ebe81c046fc (text,numeric) AS

SELECT
    member,
    address,
    lastseen,
    speed,
    canshowonmap,
    CAST(ST_Distance(
        locations.point,
        $1::geography
    ) as integer) AS distance
FROM
    userlocations_match locations
WHERE
        member <> $2

    and exists (
        select 1
        from usersettings u
        where
                u.id = $2
            and (u.settings->>'nearbymembers')::boolean = TRUE
    )

    and ST_DWithin(locations.point, $1::geography, 10000000)
    and lastseen > (now() - '2 day'::interval)

ORDER BY
    locations.point <-> $1::geography
LIMIT 20

;
EXECUTE a3ba714a222c649d6859c6ebe81c046fc('POINT(20.298233281852475 63.81847655682639)',214225);
DEALLOCATE a3ba714a222c649d6859c6ebe81c046fc;