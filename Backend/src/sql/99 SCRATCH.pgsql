SET ROLE 'tw_read';

-- select username, tokens, settings
-- from public.appsettings;

REFRESH MATERIALIZED VIEW CONCURRENTLY logins;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;

-- select * from
-- tabler where id = '124253'


REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;

REFRESH MATERIALIZED VIEW structure_tabler_roles;
REFRESH MATERIALIZED VIEW structure;

delete from clubs

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
where id = 250947


delete from tabler
where to_char(modifiedon, 'YYYY-MM-DD') = '2019-07-11'


select jsonb_array_elements_text(settings->'favorites')::int
from usersettings