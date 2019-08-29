SET ROLE 'tw_read_dev';

REFRESH MATERIALIZED VIEW profiles_privacysettings;

-- select username, tokens, settings
-- from public.appsettings;

REFRESH MATERIALIZED VIEW CONCURRENTLY logins;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;

-- select * from
-- tabler where id = '124253'


REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;

REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure;

delete from clubs

select * from profiles where id = 9699;

select * from clubs;


select * from structure_areas;

select * from clubs;


delete from clubs;


select * from notification_birthdays


select * from jobhistory
order by runon desc

select count(*), to_char(modifiedon, 'YYYY-MM-DD')  from tabler
group by to_char(modifiedon, 'YYYY-MM-DD')
order by 2 desc
limit 100

select * from profiles
where lastname = 'Angermann'

select distinct company->>'sector'
from (
    select jsonb_array_elements(data->'companies') company
    from tabler
    -- where id = 9102
) companies
where  company->>'sector' is not null
order by 1

select data->'rt_privacy_settings'
from tabler
where data->'rt_privacy_settings' is not null

delete from tabler
where to_char(modifiedon, 'YYYY-MM-DD') = '2019-07-11'


select jsonb_array_elements_text(settings->'favorites')::int
from usersettings


select data
  from tabler
    where id = 9102


select id
from
(
  select profiles.id
  from profiles, profiles_privacysettings
  where
        profiles.id = profiles_privacysettings.id
    and removed = false
    and get_profile_access(profiles_privacysettings.company,
      profiles.id, profiles.club, profiles.association,
      1024, 129, 'de'
    ) = true
    and companies @> ANY(ARRAY['[{"sector": "personal-care"}]']::jsonb[])
) companies



select companies
from profiles


select md5('abc')


select count(*) from geocodes


select * from userlocations

select * from userlocations


explain
SELECT
  member,
  address,
  cast(ST_Distance(
    locations.point,
    'POINT(-122.09695274 37.34562364)'::geography
  ) as integer) AS distance
FROM
  userlocations_match locations
WHERE
member <> 10430
  and exists (
    select 1
    from usersettings u
    where u.id = 10430
    and (u.settings->>'nearbymembers')::boolean = TRUE
  )

and ST_DWithin(locations.point, 'POINT(-122.09695274 37.34562364)'::geography, 10000)
and association = 'de'
ORDER BY
  locations.point <-> 'POINT(-122.09695274 37.34562364)'::geography

LIMIT 10;


SELECT ROW_NUMBER() over (order by id) as nbr, id

select *
from userlocations


select * from jobhistory



update userlocations
set id = orderedprofile.id
from
(
  SELECT ROW_NUMBER() over (order by id) as nbr, id
  from profiles
  where removed = FALSE
  and id <> 10430

) orderedprofile
where
    userlocations.id = orderedprofile.nbr
and userlocations.id <> 10430
;



update userlocations
set address = NULL
where id = 7831


select * from userlocations_match
where member = 7831

select max_conn,used,res_for_super,max_conn-used-res_for_super res_for_normal
from
  (select count(*) used from pg_stat_activity) t1,
  (select setting::int res_for_super from pg_settings where name=$$superuser_reserved_connections$$) t2,
  (select setting::int max_conn from pg_settings where name=$$max_connections$$) t3





select point_x from userlocations_match


select
  lastseen,
  address->>'city' as city,
  address->>'street' as street,
  address->>'country',
  accuracy,
  ST_X(point::geometry) as longitude,
  ST_Y(point::geometry) as latitude
from userlocations_history
where id = 10430
order by lastseen desc

alter trigger userlocations_audit_trigger disable


create table userlocations_backup as
select * from userlocations




select * from userlocations_history


update usersettings
set settings = jsonb_set(settings, '{nearbymembers}', 'true')



explain
SELECT
  member,
  address,
  cast(ST_Distance(
    locations.point,
    'POINT(-122.09695274 37.34562364)'::geography
  ) as integer) AS distance
FROM
  userlocations_match locations, usersettings u
WHERE
member <> 10430
  and u.id = 10430
    and (u.settings->>'nearbymembers')::boolean = TRUE


and ST_DWithin(locations.point, 'POINT(-122.09695274 37.34562364)'::geography, 10000)
and association = 'de'
ORDER BY
  locations.point <-> 'POINT(-122.09695274 37.34562364)'::geography

LIMIT 10;


delete from clubs;
delete from tabler;


select * from clubs


select * from profiles


select * from jobhistory


select profiles.id, lastname, settings from usersettings, profiles
where usersettings.id = profiles.id

update usersettings
set settings = '{"favorites":[9601,11024,126977],"nearbymembers":true}'
where id = 9699


select usersettings.id, lastname, settings
from usersettings, profiles
where usersettings.id = profiles.id



update userlocations
set address = null
where id in (8097, 8096,7938, 7947)


select id from userlocations
where address is not null


update usersettings
set settings = jsonb_set('{}', '{nearbymembers}', 'true')


select * from usersettings

update usersettings
set settings = null