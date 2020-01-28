#!/bin/bash
source ~/.bashrc
source ../../../../config/.env
source ../../../../config/.env.local

# STACK="$(aws cloudformation list-exports)"
# RDSHOST="$(echo $STACK | jq -r -c '.Exports[] | select(.Name == "DatabaseHostId") | .Value')"

export PGPASSWORD=$DB_PASSWORD
CS="host=$DB_HOST port=5432 dbname=$DB_DATABASE user=$DB_USER sslmode=require"

psql "$CS"

#eof
