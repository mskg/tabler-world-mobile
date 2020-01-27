SET ROLE tw_read_dev;


UPDATE usersettings
SET settings = jsonb_set(coalesce(settings, '{}'::jsonb), '{nearbymembersMap}', '"true"');


select distinct area
from profiles
where not exists (
    select 1 from structure_areas
    where id = profiles.area
)

select id, lastname, firstname, associationname
from profiles
where area is null
and removed = false


select * from
profiles where id = 216330


select lastname, firstname
from tabler where id in
(

    select id
from profiles
where area is null or club is null
or association is null

and removed = false
)

select * from
jobhistory
order by runon desc

where result is null


select * from usersettings
where id =14225

select * from profiles where id = 128511

select id
from
    profiles o
where id in (

        select (data->>'member')::int as id
        from
        (
            select json_array_elements(boardAssistants) as data
            from
                structure_associations
        ) board
)
and
    o.removed = true



select id, flag, name
from structure_associations


select * from assets

where point is null