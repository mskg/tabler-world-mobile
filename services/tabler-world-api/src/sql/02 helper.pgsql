SET ROLE 'tw_read_dev';

------------------------------
-- Functions
------------------------------

CREATE or replace FUNCTION remove_key_family (val text) returns text as $$
BEGIN
    return regexp_replace(val, 'rti_|lci_|c41_|tci_|aci_', '', 'g');
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_family (val text) returns text as $$
BEGIN
    if strpos(lower(val), 'agoraclub') > 0 then
        return 'aci';
    end if;

    if strpos(lower(val), 'ladiescircle') > 0 then
        return 'lci';
    end if;

    if strpos(lower(val), '41er') > 0 then
        return 'c41';
    end if;

    return 'rti';
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_association (family text, val text) returns text as $$
BEGIN
    return family || '_' || regexp_replace(val,'[^\-]*-','','g');
END;
$$
LANGUAGE plpgsql;

-- removes the last element in the array of val split by delim
CREATE or replace FUNCTION remove_last_element (val text, delim text) returns text as $$
DECLARE
    arr text[];
    nbr int;
BEGIN
    arr := regexp_split_to_array(val, delim);
    nbr := array_length(arr, 1) - 1;
    return array_to_string(arr[1:nbr], delim);
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_area (assoc text, val text) returns text as $$
BEGIN
-- replace(val, '-' || public.remove_key_family(assoc), '');
    return assoc || '_' || public.remove_last_element(val, '-');
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_club (assoc text, val text) returns text as $$
BEGIN
--    replace(val, '-' || public.remove_key_family(assoc), '');
    return assoc || '_' || public.remove_last_element(val, '-');
END;
$$
LANGUAGE plpgsql;

-- takes the id and converts it to a DXX format
CREATE or replace FUNCTION make_area_number (id text) returns text as $$
DECLARE
        corrected text;
        number text;
        letter text;
BEGIN
    -- need to remove family prefixes
    corrected := public.remove_key_family(id);

    number := regexp_replace(corrected, '[^0-9]+', '', 'g');
    letter := substring(id from (position('_' in corrected) + 1) for 1);

    if number = '' THEN
        return upper(substring(corrected from (position('_' in corrected) + 1) for 3));
    end if;

    return upper(letter) || number;
END;
$$
LANGUAGE plpgsql;

drop function if exists make_short_reference (text, text) cascade;

-- type: family, assoc, area, club
CREATE or replace FUNCTION make_short_reference (family text, type text, id text) returns text as $$
DECLARE result text;
        corrected text;
BEGIN
    corrected := public.remove_key_family(id);

    if family = 'lci' then
        case
            when type = 'family' then result = 'LCI';
            when type = 'assoc' then result = 'LC ' || upper(corrected);
            when type = 'area' then result = public.make_area_number(corrected);
            else result = 'LC' || regexp_replace(corrected, '[^0-9]+', '', 'g');
        end case;
    ELSIF family = 'aci' then
        case
            when type = 'family' then result = 'ACI';
            when type = 'assoc' then result = 'AC ' || upper(corrected);
            when type = 'area' then result = public.make_area_number(corrected);
            else result = 'AC' || regexp_replace(corrected, '[^0-9]+', '', 'g');
        end case;
    ELSIF family = 'c41' then
        case
            when type = 'family' then result = '41I';
            when type = 'assoc' then result = '41 ' || upper(corrected);
            when type = 'area' then result = public.make_area_number(corrected);
            else result = '41C' || regexp_replace(corrected, '[^0-9]+', '', 'g');
        end case;
    else
        case
            when type = 'family' then result = 'RTI';
            when type = 'assoc' then result = 'RT ' || upper(corrected);
            when type = 'area' then result = public.make_area_number(corrected);
            else result = 'RT' || regexp_replace(corrected, '[^0-9]+', '', 'g');
        end case;
    end if;

    return result;
END;
$$
LANGUAGE plpgsql;
