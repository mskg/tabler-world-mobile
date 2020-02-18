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