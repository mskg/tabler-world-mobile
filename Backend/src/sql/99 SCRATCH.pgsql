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

select * from profiles
where lastname = 'Menneckemeyer'

select * from tabler
where id in (
    select id from profiles
    where lastname ='Kling'
)


select * from notification_all_birthdays
where birthdate = birthdate('07/14/19'::date)

select get_role_shortname('Distrikt 14')



select distinct address->'country'
from profiles

select
	jsonb_strip_nulls(jsonb_build_object(
        'name',
        nullif(data->>'bank_name', ''),

        'iban',
        nullif(data->>'bank_account_nr', ''),

        'bic',
        nullif(data->>'bank_bic', ''),

        'owner',
        nullif(data->>'owner', ''),

        'currency',
        nullif(data->>'currency', '')
    )) as account
    ,nullif(data->>'email', '') email
    ,nullif(data->>'phone', '') phone

from clubs


select u.id as userid, u.rtemail rtemail, a.tokens, p.id as bid, p.firstname, p.lastname
from
    notification_all_birthdays p,
    profiles u,
    appsettings a

where
        p.birthdate = birthdate('07/16/19'::date)
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