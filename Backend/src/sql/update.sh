#!/bin/bash
source ~/.bashrc
source ../../../config/.env

# STACK="$(aws cloudformation list-exports)"
# RDSHOST="$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "DatabaseHostId") | .Value')"

export PGPASSWORD=$DB_PASSWORD
CS="host=$DB_HOST port=5432 dbname=$DB_DATABASE user=$DB_USER sslmode=require"

psql "$CS" <<OMG
BEGIN;

\i '00 setup.pgsql'
\i '01 settings.pgsql'
\i '01 tablers.pgsql'
\i '01 clubs.pgsql'
\i '02 roles.pgsql'
\i '04 profiles.pgsql'
\i '05 structure.pgsql'
\i '06 notifications_birthdays.pgsql'
\i '07 search.pgsql'
\i '08 jobs.pgsql'

select count(*) as tablers from tabler;
select count(*) as profiles from profiles;
select count(*) as structure from structure;

COMMIT;
OMG

#eof
