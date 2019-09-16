SET ROLE 'tw_read_dev';

------------------------------
-- CLEANUP
------------------------------

drop view if exists tabler_roles cascade;

------------------------------
-- Functions
------------------------------

CREATE or replace FUNCTION get_role_reference(val text) RETURNS text AS $$
BEGIN
    if val is null then
        return 'rti';
    end if;

    if val = 'RT Germany' then
        return 'de';
    end if;

    if position('Distrikt ' in val) > 0 then
        return trim('de_' || right(val, position('Distrikt ' in val)));
    end if;

    return trim('de_' || replace(left(val, position(' ' in val)), 'RT', ''));
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION get_role_shortname(val text) RETURNS text AS $$
BEGIN
    if val = 'Round Table International' then
        return 'RTI';
    end if;

    if val = 'RT Germany' then
        return 'RTD';
    end if;

    if position('Distrikt ' in val) > 0 then
        return trim('D' || replace(val, 'Distrikt ', ''));
    end if;

    return trim(left(val, position(' ' in val)));
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION get_role_referencetype(val text) RETURNS text AS $$
BEGIN
    if val is null then
        return 'rti';
    end if;

    -- region

    if position('RT ' in val) > 0 then
        return 'assoc';
    end if;

    if position('Distrikt ' in val) > 0 then
        return 'area';
    end if;

    return 'club';
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION get_role_name(val text) RETURNS text AS $$
BEGIN
    if val is null then
        return 'Round Table International';
    end if;

    return trim(val);
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION get_role_group(val text) RETURNS text AS $$
BEGIN
    if val is null then
        return 'Board';
    end if;

    return trim(val);
END;
$$
LANGUAGE plpgsql;


------------------------------
-- Roles
------------------------------

CREATE or replace VIEW tabler_roles
as
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
    ,get_role_name(
        rtrim(
            ltrim(
                (
                    regexp_matches(
                        t->'combination'->>'short_description',
                        '.*[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)[^\s\w\-\.\/\(\)]\s([\s\w\d\.\-\/\(\)]+)\/\s([\s\w\d\.\-\/\(\)]+)$')
                )[1]
            )
        )
    ) as level
    ,get_role_reference(
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
    ,get_role_referencetype(
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
    ,get_role_group(
        rtrim(
            ltrim(
                (
                    regexp_matches(
                        t->'combination'->>'short_description',
                        '.*[^\s\w\-\.\/\(\)]\s([^\/]+)\s\/\s[^\/]+$'
                    )
                )[1]
            )
        )
    ) as groupname
from
    tabler,
    jsonb_array_elements(tabler.data->'rt_global_positions') t
;
