SET ROLE tw_read_dev;

-- use this a scratchpad

select * from userlocations
where address->'city' is null
and address->'region' is null

update userlocations
set address = null
where address->'city' is null
and address->'region' is null


select * from userlocations
where id = (
    select id
    from profiles
    where rtemail = 'pierre.dimartino@146-fr.roundtable.world'
)

select * from usersettings
where id = 14225

select * From  userroles


update usersettings
set settings = jsonb_set(settings, '{nearbymembers}', 'true')
where id = 14225


select id
    from profiles
    where rtemail = 'danielsigurdur.edvaldsson@5-is.roundtable.world'


select *
    from profiles
    where rtemail like 'en.%@35-no.roundtable.world'


select id
from profiles
where firstname = 'Paolo'
and lastname = 'PAGANI'


select * From tabler
where id = 147888


select* From tabler
where id in (147887, 147888)



select* From tabler_roles
where id in (147887, 147888)

select * from
tabler where id = 247982

select * from
structure_associations where id = 'rti_in'

select * from
structure_areas where association = 'rti_in'


insert into userroles
values (314390, ARRAY['i18n'])



insert into userroles
values (122654, ARRAY['i18n'])

select id, *
from profiles
where id in (
    select id from tabler_roles
    where reftype = 'assoc' and isvalid = true
    limit 200
) and removed = true

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




INSERT INTO tabler(id, data, modifiedon, lastseen)
VALUES(-1, '{"a": "c"}', now(), now())
ON CONFLICT (id)
DO UPDATE
  SET
    data = excluded.data,
    modifiedon = case
        when tabler.data::text <> excluded.data::text then excluded.modifiedon
        else tabler.modifiedon
    end,
    lastseen = excluded.lastseen
RETURNING modifiedon, lastseen

delete from tabler
where id = -1


update tabler
set data = '{}'
where lastseen > now() - interval '1 hour'


select id from
tabler
where modifiedon > now() - interval '1 hour'


select id, modifiedon, lastseen, data
from tabler
where lastseen > now() - interval '1 hour'


select * From userlocations


PREPARE sql1582553237507 (integer[]) AS
select *
from profiles
where
    id = ANY($1)
and removed = FALSE
;
explain
EXECUTE sql1582553237507(ARRAY[222195]);
DEALLOCATE sql1582553237507;