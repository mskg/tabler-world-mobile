SET ROLE tw_read_dev;


UPDATE usersettings
SET settings = jsonb_set(coalesce(settings, '{}'::jsonb), '{nearbymembersMap}', '"true"');


select * from
usersettings