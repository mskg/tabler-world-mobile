SET ROLE tw_read_dev;


select count(*)
from usersettings

select area, club, count(*)
from
    profiles, usersettings
where
    profiles.id = usersettings.id
and association = 'rti_is'
group by area, club
order by 3


select area, club, count(*)
from
    profiles, usersettings
where
    profiles.id = usersettings.id
and association = 'rti_is'
group by area, club
order by 3


select data->>'uname' as uname
from
    tabler
where
    data->>'rt_generic_email' = 'markus.kling@129-de.roundtable.world'

select distinct data->>'rt_status'
From clubs
where id = 'rti_ro_22'

select * From
usersettings where id = 14225
