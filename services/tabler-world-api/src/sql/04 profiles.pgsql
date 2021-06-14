SET ROLE 'tw_read_dev';

drop materialized view if exists profiles CASCADE;

create materialized view profiles
as
select
    *
    ,row_number() over(order by lastname, firstname) as cursor_lastfirst
    -- ,row_number() over(order by cast(coalesce(data->>'last_modified', '1979-01-30') as timestamptz(0))) as cursor_modified
from (
select
	id
	,modifiedon
	,(
		CASE
		WHEN
			-- data->>'rt_status' = 'active'
				data->>'rt_is_guest' = 'false'
			and data->>'permission_level' = 'can_login'
            and coalesce(data->>'is_deceased', 'false') = 'false'
			--member
			and id in (
				select id
				from structure_tabler_roles tr
				where
				    tr.id = tabler.id
				and
				    function in (
                         4306, 4307     -- rti: member, honorary
				        ,82538, 82542   -- lci: member, honorary
                        ,28408, 28411   -- c41: member, honorary
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
	,cast(data->>'rt_date_joined' as DATE) as datejoined

	,data->>'profile_pic' as pic
	-- always private
	-- data->>'email' as email
	,data->>'rt_generic_email' as rtemail

	,data->'phonenumbers' as phonenumbers
	,data->'emails_secondary' as emails
	,data->'social_media' as socialmedia

    -- club
    ,make_key_club(
        make_key_association(
            make_key_family(data->>'rt_generic_email'),
            data->>'rt_association_subdomain'
        ),
        data->>'rt_club_subdomain'
     ) club
	,data->>'rt_club_name' as clubname
    -- area
	,make_key_area(
        make_key_association(
            make_key_family(data->>'rt_generic_email'),
            data->>'rt_association_subdomain'
        ),
        data->>'rt_area_subdomain'
     ) area
	,data->>'rt_area_name' as areaname

    -- association
	,make_key_association(
        make_key_family(data->>'rt_generic_email'),
        data->>'rt_association_subdomain'
     ) as association
	,data->>'rt_association_name' as associationname
    ,make_key_family(data->>'rt_generic_email') as family
    ,cast(data->>'rt_all_families_optin' as boolean) as allfamiliesoptin
	,(
		select value
		from jsonb_array_elements(data->'address') t
		where
                t.value @> '{"address_type": 5}'    -- rti
             or t.value @> '{"address_type": 4335}' -- lci
             or t.value @> '{"address_type": 1414}' -- c41
		limit 1
	) as address
	,(
        -- for the ladies, it's the second field, fixme!
        select string_agg(jv, ' ')
        from (
            -- for the ladies, it's the second field, fixme!
            select jr->>'value' as jv, jr->>'key' as jk
            from
                jsonb_array_elements(data->'custom_fields') fields,
                jsonb_array_elements(fields->'rows') jr
    		where  jr->>'key' in (
                'First name partner',
                'Surname partner',
                'Name partner'
            )
            order by jk -- first before surename
        ) fieldsquery
	) as partner
	,(
		select jsonb_agg(role)
		from (
			select
				jsonb_build_object(
					'name', functionname,
					'group', groupname,
					'level', reftype,

					'ref',
					jsonb_build_object(
						'name',
						refname,
                        'shortname',
                        make_short_reference(
                            make_key_family(tabler.data->>'rt_generic_email'),
                            reftype, refid
                        ),
						'id',
						refid,
						'type',
						reftype
					)
				) as role
				from structure_tabler_roles
				where
					structure_tabler_roles.id = tabler.id
					and functionname not in ('Member', 'Past Member')
                    and refid is not null -- safety
				order by functionname
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
                nullif(
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
                    )),
                    '{}'
                ) as address
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
                nullif(
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
                    )),
                    '{}'
                ) as address
            from jsonb_array_elements(data->'educations') t
        ) educations
    ) as educations

	,data->'rt_privacy_settings' as privacysettings
from tabler
) formatted
where
        family is not null
    and association is not null
    and area is not null
    and club is not null
;

CREATE UNIQUE INDEX idx_profiles_id
ON public.profiles USING btree (id ASC)
;

-- CREATE INDEX idx_profiles_modifiedon
-- ON public.profiles USING btree (modifiedon ASC)
-- ;

-- CREATE UNIQUE INDEX idx_profiles_cursormodified
-- ON public.profiles USING btree (cursor_modified ASC)
-- ;

CREATE INDEX idx_profiles_id_removed
ON public.profiles USING btree (id, removed)
;
-- CREATE INDEX idx_profiles_club
-- ON public.profiles USING btree (association, club, removed)
-- ;

CREATE INDEX idx_email_removed
ON public.profiles USING btree (rtemail, removed)
;

-- CREATE INDEX idx_profiles_association_area
-- ON public.profiles USING btree (association, area, removed)
-- ;

-- CREATE INDEX idx_profiles_association
-- ON public.profiles USING btree (association, removed)
-- ;