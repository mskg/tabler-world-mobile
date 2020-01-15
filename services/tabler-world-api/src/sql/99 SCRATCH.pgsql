SET ROLE 'tw_read_dev';


select *
from structure_clubs
limit 100


select *
from structure_areas
limit 100


select *
from structure_clubs
limit 100


select * from
profiles
limit 100


select * from
structure_areas


select * from
clubs


select * From profiles
where lastname = 'Kling'

select * From tabler
where data->>'last_name' = 'Kling'


REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas

REFRESH MATERIALIZED VIEW CONCURRENTLY structure_groups


select
    distinct functionname
from
    structure_tabler_roles
order by 1

select count(*)
from tabler





select * from tabler
where data->>'last_name' = 'Kling'


select * from jobhistory


REFRESH MATERIALIZED VIEW CONCURRENTLY structure_groups;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas;


select roles from profiles
where lastname = 'Walter'
and firstname = 'Sebastian'


select *
from structure_tabler_roles
where id = 14225

select *
from tabler_roles
where reftype = 'root'
and isvalid = true

select * from structure_groups


select removed, count(*)
from profiles
group by removed

select count(*) from tabler_roles
where
    groupname = 'Members'
and functionname = 'Member'
and isvalid = true

select distinct groupname, functionname, reftype
from tabler_roles
where
    function in (4306, 4307)
    	or function < 100
and isvalid = true


WITH RECURSIVE groups_objects (type, assoc, id, name, path, object) AS (
  SELECT
    'root' as type
    ,'null' as assoc
    ,data->>'id' as id
    ,data->>'name' as name
    ,ARRAY[data->>'id'] as path
    ,jsonb_array_elements(data->'children') as object
  FROM groups
  where id = 'rti'
  UNION

  SELECT type, assoc, id, name, path, jsonb_array_elements(children)
  FROM (
    SELECT
        -- based on the current node, the child gets a ...
        case
            WHEN object->>'name' = 'Associations' THEN 'assoc'
            when object->>'name' = 'Areas' THEN 'area'
            when object->>'name' = 'Tables' THEN 'club'
            else 'node'
        end as type
        -- we pull the association down to make that unique
        ,case
            WHEN type  = 'assoc' THEN object->>'name'
            else assoc
        end as assoc
        ,object->>'id' as id
        ,object->>'name' as name
        ,array_append(path, object->>'id') as path
        ,object->'children' children
    FROM groups_objects
    WHERE jsonb_array_length(object->'children') > 0
  ) s
)
SELECT type, assoc, id::int as parentId, (object->>'id')::int as id, path::int[], object->>'name' as name
FROM groups_objects



select * from structure_groups
select * from structure_parentgroups


select distinct name
from structure_areas
order by 1

select id
from structure_areas
order by 1



select
	id
    ,make_key_association(data->>'parent_subdomain') as association
    ,data->>'name' as name
	,regexp_replace(id,'[^0-9]+','','g') areanumber
    ,(
        select array_to_json(array_agg(r))
        from
        (
            select id as member, functionname as role
            from structure_tabler_roles
            where
                    reftype = 'area'
                and refid = areas.id
                and groupname = 'Board'
        ) r
    ) as board
    ,(
        select array_agg(id)
        from structure_clubs
        where
                association = make_key_association(data->>'parent_subdomain')
            and area = make_key_area(data->>'parent_subdomain', data->>'subdomain')
    ) as clubs
from areas;


select association, area, count(*)
from profiles
where removed = false
group by association, area
order by 3, 1, 2


select association, count(*)
from profiles
where removed = false
group by association
order by 2 desc, 1



SET ROLE 'tw_read_dev';

CREATE or replace FUNCTION make_area_number (id text) returns text as $$
DECLARE number text;
        letter text;
BEGIN
    number := regexp_replace(id, '[^0-9]+', '', 'g');
    letter := substring(id from (position('_' in id) + 1) for 1);

    if number = '' THEN
        return upper(substring(id from (position('_' in id) + 1) for 3));
    end if;

    return upper(letter) || number;
END;
$$
LANGUAGE plpgsql;



select make_area_number(id)
from areas

select distinct name
from structure_associations

@129


select * from jobhistory
order by runon desc


select * from tabler
where data->>'last_name'= 'Kling'

select count(*) from tabler;

select count(*) from groups;
select count(*) from families;
select count(*) from areas;
select count(*) from associations;
select count(*) from clubs;


create table profile_backup
as
select
    id,
    rtemail
from
    profiles
WHERE
    rtemail is not null

select board, boardAssistants
from structure_clubs

select * from profiles
where lastname = 'Kling'


select * from structure_clubs;

select * from struc

BEGIN;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_groups;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations;
COMMIT;



select lastname, u.*
from usersettings u,
profiles p
where u.id = p.id


select * from notification_receipts