-- Table: public.tabler
SET ROLE 'tw_read_dev';

drop view if exists structure_clubs cascade;
drop view if exists structure_areas cascade;
drop view if exists structure_associations cascade;

drop materialized view if exists structure_tabler_roles;
drop materialized view if exists structure;

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

CREATE or replace VIEW structure_clubs
as
select
    regexp_replace(data->>'subdomain','[^a-z]+','','g') as association
	,cast(regexp_replace(data->>'parent_subdomain','[^0-9]+','','g') as integer) area
	,cast(regexp_replace(data->>'subdomain','[^0-9]+','','g') as integer) club
    ,data->>'name' as clubname
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
from clubs
where
    data->>'rt_status' = 'active'
order by 1, 2, 3;

CREATE or replace VIEW structure_associations
as
select distinct association, associationname
from profiles
where
        associationname is not null
    and association is not null
    and removed = false
order by 1, 2;

CREATE or replace VIEW structure_areas
as
select
    distinct
    regexp_replace(data->>'subdomain','[^a-z]+','','g') as association
	,cast(regexp_replace(data->>'parent_subdomain','[^0-9]+','','g') as integer) as area,
    'Distrikt ' || regexp_replace(data->>'parent_subdomain','[^0-9]+','','g') as areaname
from clubs
where data->>'rt_status' = 'active'
order by 1, 2;

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

create MATERIALIZED view structure as
select array_to_json(array_agg(row_to_json(a))) as structure
from (
    select association, associationname as name,
        (
            select array_to_json(array_agg(row_to_json(d)))
            from (
                select area, areaname as name, association,
                    (
                        select array_to_json(array_agg(row_to_json(t)))
                        from (
                            select club, clubname as name, website, logo
                                , meetingplace1, meetingplace2, info
                                , association, area, account, phone, email
                               ,(
                                    select array_to_json(array_agg(r))
                                    from
                                    (
                                        select id as member, name as role
                                        from structure_tabler_roles
                                        where
                                                groupname = 'Board'
                                            and level = clubname
                                    ) r
                                ) as board,
                                (
                                    select array_to_json(array_agg(r))
                                    from
                                    (
                                        select id as member, name as role
                                        from structure_tabler_roles
                                        where
                                                groupname = 'Board Assistants'
                                            and level = clubname
                                    ) r
                                ) as boardAssistants
                            from structure_clubs
                            where
                                    structure_associations.association = structure_clubs.association
                                and structure_areas.area = structure_clubs.area
                            order by club
                        ) t
                    ) as clubs,
                    (
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
                from structure_areas
                where structure_associations.association = structure_areas.association
                order by area
            ) d
        ) as areas,
        (
            select array_to_json(array_agg(r))
            from
            (
                select id as member, name as role
                from structure_tabler_roles
                where
                        groupname = 'Board'
                    and level = associationname
            ) r
        ) as board,
        (
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
    from structure_associations
    order by association
) a;
