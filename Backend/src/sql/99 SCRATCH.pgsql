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

select * from notification_birthdays


select * from jobhistory
order by runon desc
limit 10