SET ROLE 'tw_read_dev';

drop materialized view if exists profiles CASCADE;

create materialized view profiles
as
select
	id
	,modifiedon
	,(
		CASE
		WHEN
			-- data->>'rt_status' = 'active'
				data->>'rt_is_guest' = 'false'
			and data->>'permission_level' = 'can_login'
			--member
			and id in (
				select id
				from tabler_roles tr
				where
					tr.isvalid = TRUE
				and tr.id = tabler.id
				and (
							function in (4306, 4307) -- member, honory
							or function < 100 -- board etc.
					)
				)
		THEN
			-- member
			FALSE
		ELSE
			-- removed
			TRUE
		END
	) as removed
	,data->>'title' as title
	,TRIM(data->>'first_name') as firstname
	,TRIM(data->>'last_name') as lastname
	,cast(data->>'birth_date' as DATE) as birthdate

	,data->>'profile_pic' as pic
	-- always private
	-- data->>'email' as email
	,data->>'rt_generic_email' as rtemail

	,data->'phonenumbers' as phonenumbers
	,data->'emails_secondary' as emails
	,data->'social_media' as socialmedia

	--,cast(data->>'rt_club_number' as integer) as club
	,cast(regexp_replace(data->>'rt_club_subdomain','[^0-9]+','','g') as integer) club
	,data->>'rt_club_name' as clubname
	,cast(regexp_replace(data->>'rt_area_subdomain','[^0-9]+','','g') as integer) area
	,data->>'rt_area_name' as areaname
	,data->>'rt_association_subdomain' as association
	,data->>'rt_association_name' as associationname
	,(
		select value
		from jsonb_array_elements(data->'address') t
		where t.value @> '{"address_type": 6}'
		limit 1
	) as address

	,(
		select value->'rows'->0->>'value'
		from jsonb_array_elements(data->'custom_fields') t
		where t.value @> '{"rows": [{"key": "Name partner"}]}'
	) as partner

	,(
		select jsonb_agg(role)
		from (
			select
					jsonb_build_object(
					'name', name,
					'group', groupname,

					'level', level,

					'ref',
					jsonb_build_object(
						'name',
						get_role_shortname(level),
						'id',
						levelid,
						'type',
						leveltype
					)
				) as role
				from tabler_roles
				where
					tabler_roles.isvalid = TRUE
					and tabler_roles.id = tabler.id
					and name not in ('Member', 'Past Member')
					and name not like 'Placeholder%'
					-- fix for RTI
					and level is not null
				order by name
		) rolesquery
	) as roles

	, (
        select jsonb_strip_nulls(jsonb_agg(row_to_json(companies)))
        from
        (
            select
                trim(value->>'name') as name,
                nullif(value->>'email', '') as email,
                nullif(value->>'phone', '') as phone,
                nullif(value->>'sector', '') as sector,
                nullif(trim(value->>'function'), '') as function,
                nullif(value->>'begin_date', '') as begin_date,
                jsonb_strip_nulls(jsonb_build_object(
                    'city',
                    nullif(value->'address'->0->>'city', ''),

                    'country',
                    nullif(value->'address'->0->>'country', ''),

                    'street1',
                    nullif(value->'address'->0->>'street1', ''),

                    'street2',
                    nullif(value->'address'->0->>'street2', ''),

                    'postal_code',
                    nullif(value->'address'->0->>'postal_code', '')
                )) as address
            from jsonb_array_elements(data->'companies') t
        ) companies
    ) as companies

    ,(
        select jsonb_strip_nulls(jsonb_agg(row_to_json(educations)))
        from
        (
            select
                nullif(trim(value->>'school_name'), '') as school,
                nullif(trim(value->>'education_name'), '') as education,
                jsonb_strip_nulls(jsonb_build_object(
                    'city',
                    nullif(value->'address'->0->>'city', ''),

                    'country',
                    nullif(value->'address'->0->>'country', ''),

                    'street1',
                    nullif(value->'address'->0->>'street1', ''),

                    'street2',
                    nullif(value->'address'->0->>'street2', ''),

                    'postal_code',
                    nullif(value->'address'->0->>'postal_code', '')
                )) as address
            from jsonb_array_elements(data->'educations') t
        ) educations
    ) as educations

	,data->>'rt_privacy_settings' as privacysettings
    ,row_number() over(order by cast(coalesce(data->>'last_modified', '1979-01-30') as timestamptz(0))) as cursor_modified
    ,row_number() over(order by data->>'last_name', data->>'first_name') as cursor_lastfirst
from tabler;

CREATE UNIQUE INDEX idx_profiles_id
ON public.profiles USING btree (id ASC)
TABLESPACE pg_default;

CREATE INDEX idx_profiles_modifiedon
ON public.profiles USING btree (modifiedon ASC)
TABLESPACE pg_default;

CREATE UNIQUE INDEX idx_profiles_cursormodified
ON public.profiles USING btree (cursor_modified ASC)
TABLESPACE pg_default;

CREATE INDEX idx_profiles_id_removed
ON public.profiles USING btree (id, removed)
TABLESPACE pg_default;

CREATE INDEX idx_profiles_club
ON public.profiles USING btree (association, club, removed)
TABLESPACE pg_default;

CREATE INDEX idx_email_removed
ON public.profiles USING btree (rtemail, removed)
TABLESPACE pg_default;

CREATE INDEX idx_profiles_association_area
ON public.profiles USING btree (association, area, removed)
TABLESPACE pg_default;

CREATE INDEX idx_profiles_association
ON public.profiles USING btree (association, removed)
TABLESPACE pg_default;