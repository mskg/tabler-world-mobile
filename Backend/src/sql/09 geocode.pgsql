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
    point geography,
    modifiedon timestamptz(0),
    CONSTRAINT geocodes_pkey PRIMARY KEY (hash)
)
WITH (
    OIDS = FALSE
);

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
    profiles.association,
    profiles.club,
    profiles.area,
    userlocations.point,
    userlocations.accuracy,
    userlocations.speed,
    userlocations.lastseen,
    jsonb_strip_nulls(jsonb_build_object(
        'location',
        jsonb_build_object(
            'longitude',
            ST_X (point::geometry),

            'latitude',
            ST_Y (point::geometry)
        ),

        'city',
        nullif(coalesce(userlocations.address->>'city', userlocations.address->0->>'city'), ''),

        'region',
        nullif(userlocations.address->>'region', ''),

        'country',
        nullif(coalesce(userlocations.address->>'isoCountryCode', userlocations.address->0->>'isoCountryCode'), ''),

        'street1',
        nullif(coalesce(userlocations.address->>'street1', userlocations.address->0->>'street1'), ''),

        'street2',
        nullif(coalesce(userlocations.address->>'street2', userlocations.address->0->>'street2'), ''),

        'postal_code',
        nullif(coalesce(userlocations.address->>'postalCode', userlocations.address->0->>'postalCode'), '')
    )) as address
from
    userlocations, profiles
where
    profiles.id = userlocations.id
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
    --     INSERT INTO account_audit (operation, account_id, account_name, debt, balance)
    --     VALUES (TG_OP, OLD.*);
    --     RETURN OLD;
    -- END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER userlocations_audit_trigger
    AFTER INSERT OR UPDATE ON userlocations
    FOR EACH ROW EXECUTE PROCEDURE userlocations_audit();
