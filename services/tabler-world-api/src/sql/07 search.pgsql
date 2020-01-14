
SET ROLE 'tw_read_dev';

DROP FUNCTION if EXISTS f_unaccent cascade;

CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text AS
$func$
SELECT public.unaccent(
    'public.unaccent',
    lower(
        replace(
            replace(
                replace($1, 'oe', 'o')
            , 'ue', 'ü')
        , 'ae', 'ä')
    )
)  -- schema-qualify function and dictionary
$func$  LANGUAGE sql IMMUTABLE;

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
