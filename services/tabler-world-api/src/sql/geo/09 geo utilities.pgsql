SET ROLE 'tw_read_prod';


------------------------------
-- Utility functions
------------------------------

CREATE OR REPLACE FUNCTION xml_escape(TEXT)
RETURNS TEXT AS $$
  SELECT replace(replace(replace($1, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
$$ LANGUAGE sql IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION kml_wrap(TEXT)
RETURNS TEXT AS $$
  SELECT
    '<kml xmlns="http://www.opengis.net/kml/2.2"><Document>'
    || $1 || '</Document></kml>';
$$ LANGUAGE sql IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION kml_concat(TEXT, geography)
RETURNS TEXT AS $$
  SELECT $1 || '<Placemark>' || st_askml($2) || '</Placemark>';
$$ LANGUAGE sql IMMUTABLE STRICT;

CREATE AGGREGATE as_kmldoc(geography) (
    sfunc = kml_concat,
    finalfunc = kml_wrap,
    stype = TEXT,
    initcond = ''
);

CREATE OR REPLACE FUNCTION kml_concat(TEXT, geography, anyelement)
RETURNS TEXT AS $$
  SELECT $1 || '<Placemark><name>' || xml_escape(cast($3 AS TEXT)) || '</name>'
  || st_askml($2) || '</Placemark>';
$$ LANGUAGE sql IMMUTABLE STRICT;

CREATE AGGREGATE as_kmldoc(geography, anyelement) (
    sfunc = kml_concat,
    finalfunc = kml_wrap,
    stype = TEXT,
    initcond = ''
);

CREATE OR REPLACE FUNCTION kml_concat(TEXT, geography, anyelement, anyelement)
RETURNS TEXT AS $$
  SELECT $1 || '<Placemark><name>' || xml_escape(cast($3 AS TEXT))
  || '</name><description>' || xml_escape(cast($4 AS TEXT))
  || '</description>' || st_askml($2) || '</Placemark>';
$$ LANGUAGE sql IMMUTABLE STRICT;

CREATE AGGREGATE as_kmldoc(geography, anyelement, anyelement) (
    sfunc = kml_concat,
    finalfunc = kml_wrap,
    stype = TEXT,
    initcond = ''
);

CREATE OR REPLACE FUNCTION join_kmldocs(VARIADIC TEXT[])
RETURNS TEXT AS $$
  SELECT kml_wrap(
    replace(
      replace(
        ARRAY_TO_STRING($1, ''),
        '<kml xmlns="http://www.opengis.net/kml/2.2"><Document>',
        '<Folder>'
       ),
       '</Document></kml>',
       '</Folder>'
    )
  );
$$ LANGUAGE sql IMMUTABLE STRICT;

------------------------------
-- Analysis
------------------------------

------------------------------
-- list with comparision of current and previous log entry
------------------------------
select
    h.id,
    p.lastname,
    lastseen,

    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude,

    cast(
        EXTRACT(EPOCH FROM (lastseen - (lag(lastseen) over client_window)))
        as integer
    ) as durations,

    cast(
        EXTRACT(EPOCH FROM (lastseen - (lag(lastseen) over client_window))) / 60
        as integer
    ) as duration,


    cast(ST_Distance(
        lag(point) over client_window,
        point
    ) as integer) AS distance,

    cast(accuracy as integer) as accuracy,


    speed,


    h.address->>'street' as street,
    h.address->>'city' as city

from
    userlocations_history h, profiles p
where
    h.id = p.id
    and h.id = 10430
WINDOW client_window as (partition by h.id order by lastseen)
order by lastseen desc


------------------------------
-- Export of a single users logs to KML, e.g. display on Google Maps
------------------------------
select to_json(as_kmldoc(point))
from userlocations_history
where
        id = 10430
    and lastseen >= '2019-10-12'


------------------------------
-- Latest update per user
------------------------------

select h.id, lastname, max(lastseen)
from
    userlocations_history h, profiles p
where
    h.id = p.id
group by h.id, lastname
order by 3 desc

------------------------------
-- Group users into daily buckets with last update
------------------------------

select maxdate, count(*)
from (
    select id, max(date_trunc('day', lastseen)) as maxdate
    from userlocations_history
    group by id
    order by 2 desc
) byday
group by maxdate