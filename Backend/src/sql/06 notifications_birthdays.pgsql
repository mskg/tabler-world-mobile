
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
as select id, birthdate(birthdate) as birthdate, firstname, lastname, association, area, club, COALESCE((
    select value->>'level'
    from jsonb_array_elements(privacysettings::jsonb) t
    where t.value @> '{"type": "birth_date"}'
    limit 1
), 'public') as privacy
from profiles
where
    removed = FALSE
    and birthdate is not null
;

drop view if exists notification_birthdays cascade;

create or replace view notification_birthdays as
select u.id as userid, u.rtemail rtemail, a.tokens, p.id as bid, p.firstname, p.lastname
from
    notification_all_birthdays p,
    profiles u,
    appsettings a

where
        p.birthdate = birthdate(current_date)
    and u.id <> p.id -- not for himself
    and p.privacy <> 'private'
    and (
            p.privacy = 'public'
        or
        (
                p.privacy = 'association'
            and p.association = u.association
        )
        or
        (
                p.privacy = 'club'
            and p.association = u.association
            and p.club = u.club
        )
   )

    and (
            a.settings->'favorites' @> ('[' || p.id || ']')::jsonb -- favorite
        or  (   -- same club
                p.club = u.club
            and p.association = u.association
        )
    )

    and a.username = u.rtemail
    and u.removed = false
;

CREATE TABLE IF NOT EXISTS notification_receipts
(
    id SERIAL PRIMARY KEY,
    createdon timestamptz(0),
    data jsonb
);
