SET ROLE 'tw_read_dev';

------------------------------
-- Functions
------------------------------

CREATE or replace FUNCTION make_key_association (val text) returns text as $$
BEGIN
    return regexp_replace(val,'[^\-]*-','','g');
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_area (assoc text, val text) returns text as $$
BEGIN
    return assoc || '_' || replace(val, '-' || assoc, '');
END;
$$
LANGUAGE plpgsql;

CREATE or replace FUNCTION make_key_club (assoc text, val text) returns text as $$
BEGIN
    return assoc || '_' || replace(val, '-' || assoc, '');
END;
$$
LANGUAGE plpgsql;

-- takes the id and converts it to a DXX format
CREATE or replace FUNCTION make_area_number (id text) returns text as $$
DECLARE number text;
        letter text;
BEGIN
    number := regexp_replace(id, '[^0-9]+', '', 'g');
    letter := substring(id from (position('_' in id) + 1) for 1);

    if number = '' THEN
        return upper(substring(id from (position('_' in id) + 1) for 3));
    end if;

    return upper(letter) || number;
END;
$$
LANGUAGE plpgsql;

-- type: family, assoc, area, club
CREATE or replace FUNCTION make_short_reference (type text, id text) returns text as $$
DECLARE result text;
BEGIN
    case
        when type = 'family' then result = 'RTI';
        when type = 'assoc' then result = 'RT' || upper(id);
        when type = 'area' then result = make_area_number(id);
        else result = 'RT' || regexp_replace(id, '[^0-9]+', '', 'g');
    end case;

    return result;
END;
$$
LANGUAGE plpgsql;