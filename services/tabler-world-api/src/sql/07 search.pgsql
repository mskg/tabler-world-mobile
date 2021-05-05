
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
    ,family
    ,id
    ,name
    ,number
    ,row_number() over(order by searchorder, name) as cursor_name
from
(
    select
        3 as searchorder
        ,'club' as type
        ,structure_clubs.family as family
        ,structure_clubs.id,
        structure_clubs.name || ', ' || structure_areas.name || ', ' || structure_associations.name as name
        ,'club:' || clubnumber as number
    from structure_clubs, structure_areas, structure_associations
    where
            structure_clubs.association = structure_associations.id
        and structure_clubs.area = structure_areas.id

    union all

    select
        2
        ,'area'
        ,structure_areas.family as family
        ,structure_areas.id,
        structure_areas.name || ', ' || structure_associations.name
        ,'area:' || coalesce(nullif(regexp_replace(structure_areas.shortname, '[^0-9]', '', 'g'), ''), '-1')
    from structure_areas, structure_associations
    where structure_areas.association = structure_associations.id

    union all

    select
        1
        ,'assoc'
        ,family
        ,id
        ,name
        ,'assoc:' || name
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
    f_unaccent(lastname || ' ' || firstname || ', ' || clubname || ', ' || areaname || ', ' || associationname) gin_trgm_ops
);

DROP INDEX if EXISTS profiles_search_text3;
CREATE INDEX profiles_search_text3 ON profiles USING gin (
    cursor_lastfirst,
    f_unaccent(lastname || ' ' || firstname) gin_trgm_ops,
    f_unaccent(clubname || ', ' || areaname || ', ' || associationname) gin_trgm_ops,
    f_unaccent(lastname || ' ' || firstname || ', ' || clubname || ', ' || areaname || ', ' || associationname) gin_trgm_ops
);

DROP INDEX if EXISTS structure_search_text;
CREATE INDEX structure_search_text ON structure_search USING gin (
    cursor_name,
    f_unaccent(name) gin_trgm_ops
);

DROP INDEX if EXISTS structure_search_number;
CREATE INDEX structure_search_number ON structure_search USING gin (
    cursor_name,
    number gin_trgm_ops
);
