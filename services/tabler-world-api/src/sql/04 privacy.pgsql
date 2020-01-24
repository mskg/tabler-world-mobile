
SET ROLE 'tw_read_dev';

DROP FUNCTION if EXISTS get_privacylevel cascade;

CREATE OR REPLACE FUNCTION get_privacylevel(privacy jsonb, field text)
  RETURNS text AS
$func$
    -- share with all associations (public) is the default
    select COALESCE((
        select value->>'level'
        from jsonb_array_elements(privacy) t
        where t.value @> jsonb_build_object('type', field)
        limit 1
    ), 'public')
$func$  LANGUAGE sql IMMUTABLE;

DROP FUNCTION if EXISTS get_profile_access cascade;

/*
select
  get_profile_access ('public', 1, 1, 'de', 2, 2, 'de')
  ,get_profile_access ('private', 1, 1, 'de', 2, 2, 'de')
  ,get_profile_access ('private', 1, 1, 'de', 1, 1, 'de')

  ,get_profile_access ('association', 1, 1, 'de', 2, 2, 'de')
  ,get_profile_access ('association', 1, 1, 'de', 2, 2, 'en')

  ,get_profile_access ('club', 1, 1, 'de', 2, 2, 'de')
  ,get_profile_access ('club', 1, 1, 'de', 2, 1, 'de')
*/
CREATE OR REPLACE FUNCTION get_profile_access(
        level text
        ,recordid integer
        ,recordclub text
        ,recordassoc text
        ,userid integer
        ,userclub text
        ,userassoc text
)
  RETURNS boolean AS $$
BEGIN
    if recordid = userid then
        return true;
    end if;

    if level = 'private' then
        return false;
    end if;

    -- all families
    if level = 'all' then
        return true;
    end if;

    -- same famnily, we currently cannot check that
    if level = 'public' then
        return true;
    end if;

    if level = 'association' and recordassoc = userassoc then
        return true;
    end if;

    if level = 'club' and recordassoc = userassoc and recordclub = userclub then
        return true;
    end if;

    return false;
END;
$$
LANGUAGE plpgsql;

drop materialized view if exists profiles_privacysettings cascade;

create materialized view profiles_privacysettings as
select
    id
    ,get_privacylevel(privacysettings::jsonb, 'gender') as gender
    ,get_privacylevel(privacysettings::jsonb, 'education') as education
    ,get_privacylevel(privacysettings::jsonb, 'custom-field-category-110') as partner
    ,get_privacylevel(privacysettings::jsonb, 'company-position') as company
    ,get_privacylevel(privacysettings::jsonb, 'birth_date') as birth_date
    ,get_privacylevel(privacysettings::jsonb, 'address-' || coalesce(address->>'id', '')) as address
    ,(
        select jsonb_agg(phone)
        from  (
            select
                jsonb_build_object(
                    'id'
                    ,phone->>'id'
                    ,'level'
                    ,get_privacylevel(privacysettings::jsonb, 'phone-' || coalesce(phone->>'id', ''))
                ) as phone
            from (
                select
                    id
                    ,jsonb_array_elements(phonenumbers) as phone
                    ,privacysettings
                from
                    profiles pp
                where
                    profiles.id = pp.id
            ) numbers
        ) phonesecurity
    ) as phonenumbers
    ,(
        select jsonb_agg(email)
        from  (
            select
                jsonb_build_object(
                    'id'
                    ,email->>'id'
                    ,'level'
                    ,get_privacylevel(privacysettings::jsonb, 'secondary-email-' || coalesce(email->>'id', ''))
                ) as email
            from (
                select
                    id
                    ,jsonb_array_elements(emails) as email
                    ,privacysettings
                from
                    profiles pp
                where
                    profiles.id = pp.id
            ) emails
        ) emailsecurity
    ) as emails
from profiles
where removed = false;

CREATE UNIQUE INDEX idx_profiles_privacysettings_id
ON profiles_privacysettings USING btree (id ASC)
TABLESPACE pg_default;