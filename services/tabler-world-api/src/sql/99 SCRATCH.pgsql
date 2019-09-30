SET ROLE 'tw_read_dev';

REFRESH MATERIALIZED VIEW profiles_privacysettings;

-- select username, tokens, settings
-- from public.appsettings;

REFRESH MATERIALIZED VIEW CONCURRENTLY logins;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;

-- select * from
-- tabler where id = '124253'


REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;

REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure;

delete from clubs

select * from profiles where id = 9699;

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
where lastname = 'Angermann'

select distinct company->>'sector'
from (
    select jsonb_array_elements(data->'companies') company
    from tabler
    -- where id = 9102
) companies
where  company->>'sector' is not null
order by 1

select data->'rt_privacy_settings'
from tabler
where data->'rt_privacy_settings' is not null

delete from tabler
where to_char(modifiedon, 'YYYY-MM-DD') = '2019-07-11'


select jsonb_array_elements_text(settings->'favorites')::int
from usersettings


select data
  from tabler
    where id = 9102


select id
from
(
  select profiles.id
  from profiles, profiles_privacysettings
  where
        profiles.id = profiles_privacysettings.id
    and removed = false
    and get_profile_access(profiles_privacysettings.company,
      profiles.id, profiles.club, profiles.association,
      1024, 129, 'de'
    ) = true
    and companies @> ANY(ARRAY['[{"sector": "personal-care"}]']::jsonb[])
) companies



select companies
from profiles


select md5('abc')


select count(*) from geocodes


select * from userlocations

select * from userlocations


explain
SELECT
  member,
  address,
  cast(ST_Distance(
    locations.point,
    'POINT(-122.09695274 37.34562364)'::geography
  ) as integer) AS distance
FROM
  userlocations_match locations
WHERE
member <> 10430
  and exists (
    select 1
    from usersettings u
    where u.id = 10430
    and (u.settings->>'nearbymembers')::boolean = TRUE
  )

and ST_DWithin(locations.point, 'POINT(-122.09695274 37.34562364)'::geography, 10000)
and association = 'de'
ORDER BY
  locations.point <-> 'POINT(-122.09695274 37.34562364)'::geography

LIMIT 10;


SELECT ROW_NUMBER() over (order by id) as nbr, id

select *
from userlocations


select * from jobhistory



update userlocations
set id = orderedprofile.id
from
(
  SELECT ROW_NUMBER() over (order by id) as nbr, id
  from profiles
  where removed = FALSE
  and id <> 10430

) orderedprofile
where
    userlocations.id = orderedprofile.nbr
and userlocations.id <> 10430
;



update userlocations
set address = NULL
where id = 7831


select * from userlocations_match
where member = 7831

select max_conn,used,res_for_super,max_conn-used-res_for_super res_for_normal
from
  (select count(*) used from pg_stat_activity) t1,
  (select setting::int res_for_super from pg_settings where name=$$superuser_reserved_connections$$) t2,
  (select setting::int max_conn from pg_settings where name=$$max_connections$$) t3





select point_x from userlocations_match


select
  lastseen,
  address->>'city' as city,
  address->>'street' as street,
  address->>'country',
  accuracy,
  ST_X(point::geometry) as longitude,
  ST_Y(point::geometry) as latitude
from userlocations_history
where id = 10430
order by lastseen desc

alter trigger userlocations_audit_trigger disable


create table userlocations_backup as
select * from userlocations




select * from userlocations_history


update usersettings
set settings = jsonb_set(settings, '{nearbymembers}', 'true')



explain
SELECT
  member,
  address,
  cast(ST_Distance(
    locations.point,
    'POINT(-122.09695274 37.34562364)'::geography
  ) as integer) AS distance
FROM
  userlocations_match locations, usersettings u
WHERE
member <> 10430
  and u.id = 10430
    and (u.settings->>'nearbymembers')::boolean = TRUE


and ST_DWithin(locations.point, 'POINT(-122.09695274 37.34562364)'::geography, 10000)
and association = 'de'
ORDER BY
  locations.point <-> 'POINT(-122.09695274 37.34562364)'::geography

LIMIT 10;


delete from clubs;
delete from tabler;


select * from clubs


select * from profiles


select * from jobhistory


select profiles.id, lastname, settings from usersettings, profiles
where usersettings.id = profiles.id

update usersettings
set settings = '{"favorites":[9601,11024,126977],"nearbymembers":true}'
where id = 9699


select usersettings.id, lastname, settings
from usersettings, profiles
where usersettings.id = profiles.id



update userlocations
set address = null
where id in (8097, 8096,7938, 7947)


select id from userlocations
where address is not null


select * from usersettings

update usersettings
set settings = jsonb_set('{}', '{nearbymembers}', 'true')


select * from usersettings

insert into usersettings



insert into  usersettings(id, tokens)
values (11024, ARRAY['ExponentPushToken[YsRXioICHlXL-1TELjEdHX]'])

set settings = null

select id from usersettings where tokens is not null


select id from profiles
where lastname = 'Steffen'
and firstname = 'Daniel'

select * from tabler
where id = 8295


select * From tabler_roles
where id in (
select id from profiles
where lastname = 'Walter'
)

select * from tabler
where id = 8295

update tabler set data = '{"id":8295,"age":36,"email":"seb-walter@gmx.de","uname":"SebastianWalter","gender":"M","address":[{"id":2177237,"city":"Hamburg","country":"DE","street1":"Papenhuder Straße 34","postal_code":"22087","address_type":6}],"companies":[{"id":589199,"name":"BBM Maschinenbau und Vertriebs GmbH","email":"sebastian.walter@bbm-germany.de","phone":"+491708805554","sector":"manufacturing-production","address":[{"id":2177238,"country":"DE"}],"function":"Business Development Manager"}],"last_name":"Walter","last_sync":"2019-07-12T11:23:22.230116Z","relatives":[],"rt_status":"active","sync_guid":"a267b93b-0850-4948-8e4f-c86bde8cd400","birth_date":"1983-06-07","created_on":"2018-06-08T20:30:38.185Z","educations":[],"first_name":"Sebastian","profile_pic":"https://roundtable-prd.s3.eu-central-1.amazonaws.com/106/profile_pic/e2b9d2db-f50f-4975-9fd4-6d2625de4e81.jpg","rt_is_guest":false,"phonenumbers":[{"id":1775193,"type":"home","value":"+49 (0) 1708805554"}],"rt_area_name":"Distrikt 2","rt_club_name":"RT84 HAMBURG-ST. PAULI","social_media":{},"custom_fields":[{"id":110,"name":"Member Info","rows":[],"type":"custom"},{"id":109,"name":"Preferences","rows":[{"id":29,"key":"Receive printed magazine?","value":"Ja"}],"type":"custom"},{"id":5040,"name":"externe_Gäste","rows":[],"type":"custom"}],"last_modified":"2019-06-18T19:40:37.749027Z","rt_club_number":84,"rt_date_joined":"2006-06-06","rt_entrance_age":22,"emails_secondary":[],"permission_level":"can_login","rt_generic_email":"sebastian.walter@84-de.roundtable.world","rt_area_subdomain":"d2-de","rt_club_subdomain":"84-de","rt_temp_member_id":"734539","preferred_language":"en","rt_local_positions":[],"rt_association_name":"RT Germany","rt_global_positions":[{"id":2219510,"end_date":"2019-11-23","start_date":"2018-09-08","combination":{"id":50,"group":18,"function":49,"short_description":"Board / Vice-President"}},{"id":3452484,"start_date":"2006-06-06","combination":{"id":15971,"group":5479,"function":4306,"short_description":"Associations › RT Germany › Areas › Distrikt 2 › Tables › RT84 HAMBURG-ST. PAULI › Members / Member"}}],"rt_privacy_settings":[{"type":"custom-field-category-110","level":"club"}],"rt_terms_approved_on":"2018-06-10T17:07:02.744378Z","rt_done_onboarding_on":"2018-06-10T17:07:02.744378Z","rt_consent_approved_on":"2018-06-10T17:07:02.744378Z","rt_association_subdomain":"de"}	'
where id = 8295


select
	id
    ,cast(t->>'start_date' as date) as start_date
    ,cast(t->>'end_date' as date) as end_date
    ,case when
        cast(t->>'start_date' as date) <= now()
            and (
				    cast(t->>'end_date' as date) is null
			    or  cast(t->>'end_date' as date) >= now()
		    )
            then TRUE
        ELSE
            FALSE
    END as isvalid
    ,cast(t->'combination'->>'function' as integer) as function
    ,rtrim(
        ltrim(
            (
                regexp_matches(
                    t->'combination'->>'short_description',
                    '.*[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)\/\s([\s\w\d\.\-\/\(\)]+)$')
            )[1]
        )
    ) as level
    ,(
        rtrim(
            ltrim(
                (
                    regexp_matches(
                        t->'combination'->>'short_description',
                        '.*[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)\/\s([\s\w\d\.\-\/\(\)]+)$')
                )[1]
            )
        )
    ) as levelid
    ,(
        rtrim(
            ltrim(
                (
                    regexp_matches(
                        t->'combination'->>'short_description',
                        '.*[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)\/\s([\s\w\d\.\-\/\(\)]+)$')
                )[1]
            )
        )
    ) leveltype
    ,rtrim(
        ltrim(
            (
                regexp_matches(
                    t->'combination'->>'short_description',
                    '.*\/\s([\s\w\d\.\-]+)$'
                )
            )[1]
        )
    ) as name
    ,rtrim(
        ltrim(
            (
                regexp_matches(
                    t->'combination'->>'short_description',
                    '.*[^\s\w\-\.\/\(\)]\s([^\/]+)\s\/\s[^\/]+$'
                )
            )[1]
        )
    ) as groupname
from
    tabler,
    jsonb_array_elements(tabler.data->'rt_global_positions') t
where id in (8295, 10472)
