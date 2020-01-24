SET ROLE 'tw_read_dev';

------------------------------
-- CLEANUP
------------------------------

-- new cleanup
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
-- Clubs
------------------------------

CREATE MATERIALIZED VIEW structure_clubs
as
select
    -- we need to stick with the combined key here as we cannot extract the id from roles
	id
    ,make_key_association(data->>'parent_subdomain') as association
	,make_key_area(make_key_association(data->>'parent_subdomain'), data->>'parent_subdomain') as area
	,cast(regexp_replace(data->>'subdomain','[^0-9]+','','g') as integer) clubnumber
    ,data->>'name' as name
    ,make_short_reference('club', id) as shortname
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
    -- logo must differ from association logo
    ,NULLIF(data->>'logo', (
        select data->>'logo'
        from associations
        where id = make_key_association(clubs.data->>'parent_subdomain')
    )) as logo
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
        select to_jsonb(array_to_json(array_agg(r)))
        from
        (
            select structure_tabler_roles.id as member, functionname as role
            from structure_tabler_roles, profiles
            where
                    profiles.id = structure_tabler_roles.id
                and removed = false
                and reftype = 'club'
                and refid = clubs.id
                and groupname = 'Board'
        ) r
    ) as board
    ,(
        select to_jsonb(array_to_json(array_agg(r)))
        from
        (
            select structure_tabler_roles.id as member, functionname as role
            from structure_tabler_roles, profiles
            where
                    profiles.id = structure_tabler_roles.id
                and removed = false
                and reftype = 'club'
                and refid = clubs.id
                and groupname = 'Board Assistants'
        ) r
    ) as boardAssistants
    ,(
        select array_agg(id)
        from profiles
        where
            removed = false
            and id in (
                select structure_tabler_roles.id
                from structure_tabler_roles, profiles
                where
                    profiles.id = structure_tabler_roles.id
                and removed = false
                and reftype = 'club'
                and refid = clubs.id
                and groupname = 'Members'
                and functionname = 'Member'
            )
    ) as members
from clubs
where
    data->>'rt_status' = 'active'
order by 1, 2, 3;

create unique index idx_structure_club_assoc_club on
structure_clubs (association, clubnumber);

create unique index idx_structure_club_id on
structure_clubs (id);

------------------------------
-- Areas
------------------------------

CREATE MATERIALIZED VIEW structure_areas
as
select
	id
    ,make_key_association(data->>'parent_subdomain') as association
    ,data->>'name' as name
    ,make_short_reference('area', id) as shortname
    ,(
        select to_jsonb(array_to_json(array_agg(r)))
        from
        (
            select structure_tabler_roles.id as member, functionname as role
            from structure_tabler_roles, profiles
            where
                    structure_tabler_roles.id = profiles.id
                and removed = false
                and reftype = 'area'
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

create unique index idx_structure_areas_id on
structure_areas (id);

------------------------------
-- Assocications
------------------------------

CREATE MATERIALIZED VIEW structure_associations
as
select
    id
    ,data->>'parent_subdomain' as family
    ,data->>'name' as name
    ,case
        when data->>'logo' = 'https://static.roundtable.world/static/images/logo/rti-large.png' then null
        else data->>'logo'
     end as logo
    ,make_short_reference('assoc', id) as shortname
   ,(
        select to_jsonb(array_to_json(array_agg(r)))
        from
        (
            select structure_tabler_roles.id as member, functionname as role
            from structure_tabler_roles, profiles
            where
                    structure_tabler_roles.id = profiles.id
                and removed = false
                and reftype = 'assoc'
                and refid = associations.id
                and groupname = 'Board'
        ) r
    ) as board
    ,(
        select to_jsonb(array_to_json(array_agg(r)))
        from
        (
            select structure_tabler_roles.id as member, functionname as role
            from structure_tabler_roles, profiles
            where
                    structure_tabler_roles.id = profiles.id
                and removed = false
                and reftype = 'assoc'
                and refid = associations.id
                and groupname = 'Board Assistants'
        ) r
    ) as boardAssistants
    ,(
        select array_agg(id)
        from structure_areas
        where
                association = id
    ) as areas
from associations;

create unique index idx_structure_associations_id on
structure_associations (id);
