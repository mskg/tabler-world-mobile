#!/bin/bash
source ~/.bashrc
source ../../../../../config/.env
source ../../../../../config/.env.local

export PGPASSWORD=$DB_PASSWORD
CS="host=$DB_HOST port=5432 dbname=$DB_DATABASE user=$DB_USER sslmode=require"

psql -qtAc "COPY geo_postalcodes (countrycode, postalcode, placename, name1, code1, name2, code2, name3, code3, latitude, longitude, accuracy) from '~/Downloads/allCountries.txt' WITH DELIMITER E'\t' NULL AS '';" "$CS"
