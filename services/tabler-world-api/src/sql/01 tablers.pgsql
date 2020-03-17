-- Table: public.tabler
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS tabler
(
    id integer NOT NULL,
    data jsonb,
    modifiedon timestamptz(0),
    lastseen timestamptz(0),
    CONSTRAINT tabler_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

ALTER TABLE tabler
    add column if not EXISTS lastseen timestamptz(0)
;
