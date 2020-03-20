-- Table: public.tabler
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS userendpoints
(
    id integer NOT NULL,

    deviceid text not null,
    devicetype text not null,

    token text not null,
    endpoint text not null,

    CONSTRAINT userendpoints_pkey PRIMARY KEY (id, devicetype, deviceid)
);
