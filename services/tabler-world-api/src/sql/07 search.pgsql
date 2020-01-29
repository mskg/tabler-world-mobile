
SET ROLE 'tw_read_dev';

------------------------------
-- CLEANUP
------------------------------

DROP FUNCTION if EXISTS f_unaccent cascade;
DROP materialized view if exists structure_search cascade;

------------------------------
-- FUNCTIONS
------------------------------

CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text AS
$func$
SELECT public.unaccent(
    'public.unaccent',
    replace(
        replace(
            replace(lower($1), 'oe', 'ö')
        , 'ue', 'ü')
    , 'ae', 'ä')
)  -- schema-qualify function and dictionary
$func$  LANGUAGE sql IMMUTABLE;

------------------------------
-- VIEWS
------------------------------

CREATE MATERIALIZED VIEW structure_search
as
select
    type
    ,id
    ,name
    ,row_number() over(order by searchorder, name) as cursor_name
from
(
    select 3 as searchorder, 'club' as type, id, name
    from structure_clubs
    union all
    select 2 as searchorder, 'area' as type, id, name
    from structure_areas
    union all
    select 1 as searchorder, 'assoc' as type, id, name
    from structure_associations
) aggregated;

CREATE UNIQUE INDEX idx_structure_search_type_id
ON structure_search USING btree (type, id);
------------------------------
-- INDEXES
------------------------------

-- removed not included as this doesn't help

DROP INDEX if EXISTS profiles_search_text;
CREATE INDEX profiles_search_text ON profiles USING gin (
    cursor_lastfirst,
    f_unaccent(lastname || ' ' || firstname) gin_trgm_ops,
    f_unaccent(clubname || ', ' || areaname || ', ' || associationname) gin_trgm_ops
);

DROP INDEX if EXISTS profiles_search_text2;
CREATE INDEX profiles_search_text2 ON profiles USING gin (
    cursor_lastfirst,
    f_unaccent(lastname || ' ' || firstname) gin_trgm_ops,
    f_unaccent(lastname || ' ' || firstname || clubname || ', ' || areaname || ', ' || associationname) gin_trgm_ops
);

DROP INDEX if EXISTS profiles_search_text3;
CREATE INDEX profiles_search_text3 ON profiles USING gin (
    cursor_lastfirst,
    f_unaccent(lastname || ' ' || firstname) gin_trgm_ops,
    f_unaccent(clubname || ', ' || areaname || ', ' || associationname) gin_trgm_ops,
    f_unaccent(lastname || ' ' || firstname || clubname || ', ' || areaname || ', ' || associationname) gin_trgm_ops
);

DROP INDEX if EXISTS structure_search_text;
CREATE INDEX structure_search_text ON structure_search USING gin (
    cursor_name,
    f_unaccent(name) gin_trgm_ops
);
