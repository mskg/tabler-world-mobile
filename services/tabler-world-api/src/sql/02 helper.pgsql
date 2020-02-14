SET ROLE 'tw_read_dev';

------------------------------
-- Functions
------------------------------

CREATE or replace FUNCTION remove_key_family (val text) returns text as $$
BEGIN
    return regexp_replace(val, 'rti_|lci_|41i_|tci_', '', 'g');
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_family (val text) returns text as $$
BEGIN
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

CREATE or replace FUNCTION make_key_area (assoc text, val text) returns text as $$
BEGIN
    return assoc || '_' || replace(val, '-' || remove_key_family(assoc), '');
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_club (assoc text, val text) returns text as $$
BEGIN
    return assoc || '_' || replace(val, '-' || remove_key_family(assoc), '');
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
    corrected := remove_key_family(id);

    number := regexp_replace(corrected, '[^0-9]+', '', 'g');
    letter := substring(id from (position('_' in corrected) + 1) for 1);

    if number = '' THEN
        return upper(substring(corrected from (position('_' in corrected) + 1) for 3));
    end if;

    return upper(letter) || number;
END;
$$
LANGUAGE plpgsql;

-- type: family, assoc, area, club
CREATE or replace FUNCTION make_short_reference (type text, id text) returns text as $$
DECLARE result text;
        corrected text;
BEGIN
    corrected := remove_key_family(id);

    case
        when type = 'family' then result = 'RTI';
        when type = 'assoc' then result = 'RT' || upper(corrected);
        when type = 'area' then result = make_area_number(corrected);
        else result = 'RT' || regexp_replace(corrected, '[^0-9]+', '', 'g');
    end case;

    return result;
END;
$$
LANGUAGE plpgsql;