-- Table: public.tabler
SET ROLE 'tw_read_dev';

-- cleanup
--drop view if exists clubs cascade;
--drop view if exists areas cascade;
--drop view if exists associations cascade;

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
