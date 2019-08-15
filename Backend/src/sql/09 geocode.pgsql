
SET ROLE 'tw_read_dev';

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
        nullif(userlocations.address->0->>'city', ''),

        'country',
        nullif(userlocations.address->0->>'isoCountryCode', ''),

        'street1',
        nullif(userlocations.address->0->>'street1', ''),

        'street2',
        nullif(userlocations.address->0->>'street2', ''),

        'postal_code',
        nullif(userlocations.address->0->>'postalCode', '')
    )) as address
from
    userlocations, profiles
where
    profiles.id = userlocations.id