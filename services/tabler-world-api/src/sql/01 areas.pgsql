-- Table: public.tabler
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS areas
(
    id text NOT NULL,
    data jsonb,
    modifiedon timestamptz(0),
    lastseen timestamptz(0),
    CONSTRAINT areas_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

ALTER TABLE areas
    add column if not EXISTS lastseen timestamptz(0)
;
