-- docker run -i --network host --rm redis redis-cli -h host.docker.internal -p 6380 < out.txt

\pset tuples_only
\pset format unaligned
\o out.txt

SELECT
    'geoadd dev:nearby:geo "'
        || ST_X (point::geometry)
        || '" "'
        || ST_Y (point::geometry)
        || '" '
        || member
        || E'\n'

    || 'set dev:nearby:' || member
        || ' "'
        || replace(
             jsonb_build_object(
                'lastseen',
                extract(epoch from lastseen) * 1000,
                'accuracy',
                accuracy,
                'speed',
                speed,
                'address',
                address,
                'position',
                jsonb_build_object(
                    'longitude',
                    ST_X (point::geometry),
                    'latitude',
                    ST_Y (point::geometry)
                )
              )::text,
              '"',
              '\"'
           )
        || E'"\n'

    || 'zadd dev:nearby:ttl '
        || extract(epoch from lastseen) * 1000
        || ' '
        || member
        || E'\n'
FROM
    userlocations_match locations
;

\o
\q