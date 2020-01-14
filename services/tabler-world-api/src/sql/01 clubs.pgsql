-- Table: public.tabler
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS clubs
(
    id text NOT NULL,
    data jsonb,
    modifiedon timestamptz(0),
    CONSTRAINT clubs_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);
