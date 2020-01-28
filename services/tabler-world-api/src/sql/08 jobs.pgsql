
SET ROLE 'tw_read_dev';

CREATE TABLE IF NOT EXISTS jobhistory
(
    id SERIAL PRIMARY KEY,
    runon timestamptz(0),
    name text,
    status text,
    data jsonb
)
WITH (
    OIDS = FALSE
);

-- if exists with PK raises and error
DO $$
    BEGIN
        ALTER TABLE jobhistory ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;
    EXCEPTION
        when others then
            RAISE NOTICE 'ERROR: %,%',SQLSTATE,SQLERRM;
    END
$$;

-- migrate
DO $$
    BEGIN
        ALTER TABLE jobhistory ADD COLUMN IF NOT EXISTS status text;
        update jobhistory set status = 'completed' where success = true;
        update jobhistory set status = 'failed' where success = false;
        ALTER TABLE jobhistory DROP COLUMN IF EXISTS success;
    EXCEPTION
        when others then
            RAISE NOTICE 'ERROR: %,%',SQLSTATE,SQLERRM;
    END
$$;

