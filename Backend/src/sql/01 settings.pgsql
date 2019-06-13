-- Table: public.tabler
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS appsettings
(
    username text NOT NULL,
    tokens text[],
    settings jsonb,
    CONSTRAINT appsettings_pkey PRIMARY KEY (username)
)
WITH (
    OIDS = FALSE
);
