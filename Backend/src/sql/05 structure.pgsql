SET ROLE 'tw_read_dev';

------------------------------
-- CLEANUP
------------------------------

-- we leave this in for the update
drop view if exists structure_clubs cascade;
drop view if exists structure_areas cascade;
drop view if exists structure_associations cascade;

-- new cleanup
drop materialized view if exists structure_tabler_roles cascade;
drop materialized view if exists structure cascade;
drop materialized view if exists structure_clubs cascade;
drop materialized view if exists structure_areas cascade;
drop materialized view if exists structure_associations cascade;

------------------------------
-- Functions
------------------------------

-- maps the keys to the same address format as members
CREATE or replace FUNCTION map_club_keys (val text) returns text as $$
DECLARE result text;
BEGIN
    case val
        when 'Address' then result = 'street1';
        when 'Address (2)' then result = 'street2';
        else result = replace(lower(val), ' ', '_');
    end case;

    return result;
END;
$$
LANGUAGE plpgsql;

------------------------------
-- Helper view
------------------------------

create materialized view structure_tabler_roles
as
    select * from tabler_roles
    where
        isvalid = TRUE
    and name not like 'Placeholder%'
;

create index idx_structure_roles_search on
structure_tabler_roles (groupname, level);

create index idx_structure_roles_roles on
structure_tabler_roles (name);

------------------------------
-- Clubs
------------------------------

CREATE MATERIALIZED VIEW structure_clubs
as
select
    -- we need to stick with the combined key here as we cannot extract the id from roles
	regexp_replace(data->>'subdomain','[^a-z]+','','g') || '_' || cast(regexp_replace(data->>'subdomain','[^0-9]+','','g') as integer) as id
    ,regexp_replace(data->>'subdomain','[^a-z]+','','g') as association
	,cast(regexp_replace(data->>'parent_subdomain','[^0-9]+','','g') as integer) area
	,cast(regexp_replace(data->>'subdomain','[^0-9]+','','g') as integer) club
    ,data->>'name' as name
    ,data->>'website' as website
	,jsonb_strip_nulls(jsonb_build_object(
        'name',
        nullif(data->>'bank_name', ''),

        'iban',
        nullif(data->>'bank_account_nr', ''),

        'bic',
        nullif(data->>'bank_bic', ''),

        'owner',
        nullif(data->>'bank_owner', ''),

        'currency',
        nullif(data->>'currency', '')
    )) as account
    ,nullif(data->>'email', '') email
    ,nullif(data->>'phone', '') phone
    ,case data->>'logo'
        when 'https://roundtable-prd.s3.eu-central-1.amazonaws.com/6/clublogo/cf647650-3926-48ac-a0cc-4bc42a099ccb.png' then null
        else data->>'logo'
    end as logo
    ,(
        select jsonb_object_agg(map_club_keys(rr->>'key'), rr->>'value')
        from (
            select jsonb_array_elements(value->'rows') as rr
            from jsonb_array_elements(data->'custom_fields') cf
            where cf.value @> '{"name": "Info"}'
        ) cfir
    ) as info
    ,(
        select jsonb_object_agg(map_club_keys(rr->>'key'), rr->>'value')
        from (
            select jsonb_array_elements(value->'rows') as rr
            from jsonb_array_elements(data->'custom_fields') cf
            where cf.value @> '{"name": "Meeting Place"}'
        ) cfir
    ) as meetingplace1
    ,(
        select jsonb_object_agg(map_club_keys(rr->>'key'), rr->>'value')
        from (
            select jsonb_array_elements(value->'rows') as rr
            from jsonb_array_elements(data->'custom_fields') cf
            where cf.value @> '{"name": "Meeting Place 2"}'
        ) cfir
    ) as meetingplace2
    ,(
        select array_to_json(array_agg(r))
        from
        (
            select id as member, name as role
            from structure_tabler_roles
            where
                    groupname = 'Board'
                and level = data->>'name'
        ) r
    ) as board
    ,(
        select array_to_json(array_agg(r))
        from
        (
            select id as member, name as role
            from structure_tabler_roles
            where
                    groupname = 'Board Assistants'
                and level = data->>'name'
        ) r
    ) as boardAssistants
    ,(
        select array_agg(id)
        from profiles
        where
                association = regexp_replace(data->>'subdomain','[^a-z]+','','g')
            and club = cast(regexp_replace(data->>'subdomain','[^0-9]+','','g') as integer)
            and removed = false
            and id in (
                select id from structure_tabler_roles
                where
                    groupname = 'Members'
                and name = 'Member'
                and level = data->>'name'
            )
    ) as members
from clubs
where
    data->>'rt_status' = 'active'
order by 1, 2, 3;

create unique index idx_structure_club_assoc_club on
structure_clubs (association, club);

create unique index idx_structure_club_id on
structure_clubs (id);

------------------------------
-- Assocications
------------------------------

CREATE MATERIALIZED VIEW structure_associations
as
select
    association
    ,associationname as name
   ,(
        select array_to_json(array_agg(r))
        from
        (
            select id as member, name as role
            from structure_tabler_roles
            where
                    groupname = 'Board'
                and level = associationname
        ) r
    ) as board
    ,(
        select array_to_json(array_agg(r))
        from
        (
            select id as member, name as role
            from structure_tabler_roles
            where
                    groupname = 'Board Assistants'
                and level = associationname
        ) r
    ) as boardAssistants
from
(
    select distinct association, associationname
    from profiles
    where
            associationname is not null
        and association is not null
        and removed = false
    order by 1, 2
) associations;

create unique index idx_structure_association on
structure_associations (association);

------------------------------
-- Areas
------------------------------

CREATE MATERIALIZED VIEW structure_areas
as
select
	association || '_' || area as id
    ,association
    ,area
    ,areaname as name
    ,(
        select array_to_json(array_agg(r))
        from
        (
            select id as member, name as role
            from structure_tabler_roles
            where
                    groupname = 'Board'
                and level = areaname
        ) r
    ) as board
    ,(
        select array_agg(id)
        from structure_clubs
        where
                association = areas.association
            and area = areas.area
    ) as clubs
from
(
    -- need to have the distinct here
    select
        distinct
            regexp_replace(data->>'subdomain','[^a-z]+','','g') as association
            ,cast(regexp_replace(data->>'parent_subdomain','[^0-9]+','','g') as integer) as area,
            'Distrikt ' || regexp_replace(data->>'parent_subdomain','[^0-9]+','','g') as areaname
    from clubs
    where data->>'rt_status' = 'active'
    order by 1, 2
) areas;

create unique index idx_structure_areas on
structure_areas (association, area);
