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

-- Migration
do $$
begin
    select * from appsettings;

    CREATE TABLE IF NOT EXISTS appsettings_migration
    as
        select id, tokens, settings
        from appsettings a, profiles p
        where a.username = p.rtemail
    ;

    drop table appsettings;

    insert into usersettings (id, tokens, settings)
    select id, tokens, settings
    from appsettings_migration;

    exception when others then
        raise notice 'ok';
        return;
end;
$$ language 'plpgsql';
