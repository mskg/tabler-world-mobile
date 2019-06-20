
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS jobhistory
(
    runon timestamptz(0),
    name text,
    success boolean,
    data jsonb
)
WITH (
    OIDS = FALSE
);

