
SET ROLE 'tw_read_dev';

create or replace function birthdate(date)
  returns date
as $$
  select (date_trunc('year', now()::date)
         + age($1, 'epoch'::date)
         - (extract(year from age($1, 'epoch'::date)) || ' years')::interval
         )::date;
$$ language sql IMMUTABLE;

drop index if exists idx_profiles_birthdate;
create index idx_profiles_birthdate on profiles(removed, birthdate(birthdate));

drop view if exists notification_all_birthdays CASCADE;

create or replace view notification_all_birthdays
as select
    profiles.id as id
    , birthdate(birthdate) as birthdate
    , firstname
    , lastname
    , allfamiliesoptin
    , family
    , association
    , area
    , club
    , profiles_privacysettings.birth_date as privacy
from profiles, profiles_privacysettings
where
        removed = FALSE
    and birthdate is not null
    and profiles.id = profiles_privacysettings.id
;

drop view if exists notification_birthdays cascade;

create or replace view notification_birthdays as
select
    -- user receiving the notification
      u.id as userid
    , u.rtemail rtemail
    , a.tokens
    , coalesce(a.settings->>'language', 'de') as lang

    -- that is the local time of the user
    , extract(hour from (
        now() at time zone coalesce(a.settings->>'timezone', 'CET'))
    ) as localhour

    -- user having birthday
    , p.id as bid
    , p.firstname
    , p.lastname
from
    notification_all_birthdays p,
    profiles u,
    usersettings a

where
        p.birthdate = birthdate(current_date)
    and u.id <> p.id -- not for himself
    and get_profile_access (
            p.privacy,
            p.id, p.club, p.association, p.family, p.allfamiliesoptin,
            u.id, u.club, u.association, u.family
        ) = true

    and (
            a.settings->'favorites' @> ('[' || p.id || ']')::jsonb -- favorite
        or  (   -- same club
                p.club = u.club
            and p.association = u.association
        )
    )

    and (
           a.settings->'notifications'->>'birthdays' is null
        or a.settings->'notifications'->>'birthdays' = 'true'
    )

    and (
        -- must have a valid push token
        array_length(a.tokens, 1) > 0
    )

    and a.id = u.id
    and u.removed = false
;

CREATE TABLE IF NOT EXISTS notification_receipts
(
    id SERIAL PRIMARY KEY,
    createdon timestamptz(0),
    data jsonb
);
