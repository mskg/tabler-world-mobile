SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS userroles
(
    id integer NOT NULL,
    roles text[],
    CONSTRAINT userroles_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

INSERT INTO userroles (id, roles) VALUES
    (14225, ARRAY['jobs', 'developer', 'i18n', 'locationhistory']),
    (336775, ARRAY['jobs', 'developer', 'i18n', 'locationhistory'])

ON CONFLICT (id)
DO
    UPDATE
        SET roles = EXCLUDED.roles
;
