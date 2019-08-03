
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
