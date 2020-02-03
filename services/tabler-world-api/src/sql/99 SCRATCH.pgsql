SET ROLE tw_read_dev;

select count(*)
from geocodes
where point is not null
;
select count(*)
from geocodes
;

select *
from geocodes
where point is null
;


select * from structure_tabler_roles
where refid is null
and groupname <> 'Past Members'


select * from tabler
where id = 15277


truncate table groups;
truncate table families;
truncate table tabler;
truncate table clubs;
truncate table areas;
truncate table associations;


select count(*) from groups;
select count(*) from families;
select count(*) from associations;
select count(*) from areas;
select count(*) from clubs;
select count(*) from tabler;


select id, status, name, data
from jobhistory
order by runon desc



REFRESH MATERIALIZED VIEW CONCURRENTLY structure_groups;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles;

REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings;

REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_families;

REFRESH MATERIALIZED VIEW CONCURRENTLY structure_search;




select id, flag, name
from structure_associations


select * from assets

where point is null


select id, settings
From
usersettings
where settings->'notifications'->>'personalChat' is null
