-- Table: public.tabler
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS usersettings
(
    id integer NOT NULL,
    tokens text[],
    settings jsonb,
    CONSTRAINT usersettings_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);
