-- Table: public.tabler
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS clubs
(
    id text NOT NULL,
    data jsonb,
    modifiedon timestamptz(0),
    lastseen timestamptz(0),
    CONSTRAINT clubs_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

ALTER TABLE clubs
    add column if not EXISTS lastseen timestamptz(0)
;

create index if not exists idx_clubs_id_status on
    clubs using gin (id, (data->>'rt_status'));


drop view if exists active_clubs cascade;

create view active_clubs as
select
    *
from clubs
where
    data->>'rt_status' in ('active', 'formation', 'preparation')
;
