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

drop index if exists idx_usersettings_nearby;
CREATE INDEX idx_usersettings_nearby ON usersettings (
    id, ((settings->>'nearbymembers')::boolean)
);

drop index if exists idx_usersettings_chat;
CREATE INDEX idx_usersettings_chat ON usersettings (
    id,
    (settings->'notifications'->>'personalChat'),
    array_length(tokens, 1)
);
