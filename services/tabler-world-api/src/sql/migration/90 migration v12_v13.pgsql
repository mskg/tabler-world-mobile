SET ROLE 'tw_read_dev';

create table if not exists profile_backup
as
select
    id,
    rtemail
from
    profiles
WHERE
    rtemail is not null
;

-- select 'insert into profile_backup values ('|| id || ', ''' || rtemail || ''')'
-- from profile_backup

drop view if exists profile_mapping CASCADE;
create VIEW profile_mapping as
select
    b.id as oldId,
    t.id as newId
from
    tabler t,
    profile_backup b
where
    t.data->>'rt_generic_email' = b.rtemail
;

update
    userlocations
set
    id = p.newId
from
    profile_mapping p
where
    id = p.oldId
;

update
    userlocations_history
set
    id = p.newId
from
    profile_mapping p
where
    id = p.oldId
;

update
    usersettings
set
    id = p.newId
from
    profile_mapping p
where
    id = p.oldId
;

update
    usersettings
set
    settings = jsonb_set(settings, '{favorites}', favorites)
from (
    select id, jsonb_agg(newid) favorites
    from (
        -- old new mapping
        select u.id, p.newid as newid
        from
            usersettings u,
            jsonb_array_elements_text(settings->'favorites') f,
            profile_mapping p
        where
            settings->'favorites' is not null
            and f::int = p.oldid

        UNION

        -- new existing
        select u.id, p.id as newid
        from
            usersettings u,
            jsonb_array_elements_text(settings->'favorites') f,
            profiles p
        where
            settings->'favorites' is not null
            and f::int = p.id
    ) updated
    group by id
 ) newFavorites
where
    usersettings.id = newFavorites.id
;
