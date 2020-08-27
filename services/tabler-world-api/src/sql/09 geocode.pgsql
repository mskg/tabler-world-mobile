SET ROLE 'tw_read_dev';

------------------------------
-- Address history
------------------------------

-- drop table geocodes;
CREATE TABLE IF NOT EXISTS geocodes
(
    hash text not null,
    query text,
    result jsonb,
    provider text,
    method text,
    point geography,
    modifiedon timestamptz(0),
    CONSTRAINT geocodes_pkey PRIMARY KEY (hash)
)
WITH (
    OIDS = FALSE
);

ALTER TABLE geocodes ADD COLUMN IF NOT EXISTS method text;
ALTER TABLE geocodes ADD COLUMN IF NOT EXISTS provider text;

------------------------------
-- Incremental Geocoding
------------------------------

drop view if exists geocodes_alladresses cascade;

CREATE or replace view geocodes_alladresses as

    select address
    from profiles
    where
        address is not null
    and (
           address->>'city' is not null
        or address->>'postalcode' is not null
    )

union ALL

    select c->'address'
    from
    (
        select jsonb_array_elements(companies) as c
        from  profiles
    ) companies
    where
    (
           c->'address'->>'city' is not null
        or c->'address'->>'postalcode' is not null
    )

union all

    select jsonb_set(meetingplace1, '{country}', to_jsonb(remove_key_family(association)))
    from structure_clubs
    where
    (
           meetingplace1->>'city' is not null
        or meetingplace1->>'postalcode' is not null
    )

union all

    select jsonb_set(meetingplace2, '{country}', to_jsonb(remove_key_family(association)))
    from structure_clubs
    where
    (
           meetingplace2->>'city' is not null
        or meetingplace2->>'postalcode' is not null
    )
;

------------------------------
-- Current user location
------------------------------

--drop table userlocations;
CREATE TABLE IF NOT EXISTS userlocations
(
    id integer NOT NULL,
    point geography,
    accuracy double precision,
    speed double precision,
    address jsonb,
    lastseen timestamptz(0),
    CONSTRAINT userlocations_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

drop index if exists idx_userlocations_point;
CREATE INDEX idx_userlocations_point ON userlocations USING gist(point);

------------------------------
-- Search locations
------------------------------

drop view if exists userlocations_match cascade;

CREATE or replace view userlocations_match as
select
    userlocations.id as member,
    userlocations.point,
    userlocations.accuracy,
    userlocations.speed,
    userlocations.lastseen,
    cast(coalesce(usersettings.settings->>'nearbymembersMap', 'false') as boolean) as canshowonmap,
    userlocations.address,
    profiles.club as club,
    profiles.family as family
from
    userlocations
    inner join profiles on (profiles.id = userlocations.id and profiles.removed = false)
    left join usersettings on userlocations.id = usersettings.id
;

------------------------------
-- History for debugging purposes
------------------------------

CREATE TABLE IF NOT EXISTS userlocations_history
(
    id integer NOT NULL,
    point geography,
    accuracy double precision,
    speed double precision,
    address jsonb,
    lastseen timestamptz(0)
)
WITH (
    OIDS = FALSE
);

drop function if exists userlocations_audit cascade;

CREATE FUNCTION userlocations_audit()
RETURNS TRIGGER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO userlocations_history (id, point, accuracy, speed, address, lastseen)
        VALUES (NEW.id, new.point, new.accuracy, new.speed, new.address, new.lastseen);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO userlocations_history (id, point, accuracy, speed, address, lastseen)
        VALUES (NEW.id, new.point, new.accuracy, new.speed, new.address, new.lastseen);
        RETURN NEW;
    END IF;

    -- ELSIF TG_OP = 'DELETE' THEN
    --     RETURN OLD;
    -- END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER userlocations_audit_trigger
    AFTER INSERT OR UPDATE ON userlocations
    FOR EACH ROW EXECUTE PROCEDURE userlocations_audit();
