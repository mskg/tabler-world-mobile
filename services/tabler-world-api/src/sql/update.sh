#!/bin/bash
source ~/.bashrc
source ../../../../config/.env
source ../../../../config/.env.local

# STACK="$(aws cloudformation list-exports)"
# RDSHOST="$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "DatabaseHostId") | .Value')"

export PGPASSWORD=$DB_PASSWORD
CS="host=$DB_HOST port=5432 dbname=$DB_DATABASE user=$DB_USER sslmode=require"

psql "$CS" <<OMG
BEGIN;

\i '00 setup.pgsql'
\i '01 settings.pgsql'
\i '01 userendpoints.pgsql'
\i '01 tablers.pgsql'
\i '01 clubs.pgsql'
\i '01 areas.pgsql'
\i '01 associations.pgsql'
\i '01 families.pgsql'
\i '01 groups.pgsql'
\i '01 assets.pgsql'
\i '01 userroles.pgsql'
\i '02 helper.pgsql'
\i '02 roles.pgsql'
\i '04 profiles.pgsql'
\i '04 privacy.pgsql'
\i '05 structure.pgsql'
\i '06 notifications_birthdays.pgsql'
\i '07 search.pgsql'
\i '08 jobs.pgsql'
\i '09 geocode.pgsql'

COMMIT;

BEGIN;

select count(*) as tablers from tabler;
select count(*) as profiles from profiles where REMOVED = false;
select count(*) as associations from structure_associations;
select count(*) as areas from structure_areas;
select count(*) as clubs from structure_clubs;

COMMIT;
OMG

#eof
