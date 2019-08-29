-- DEV --

create database dev;

create user lambda_dev WITH LOGIN;
grant rds_iam TO lambda_dev;

create role tw_read_dev;
grant all on database dev to tw_read_dev;
revoke all on database dev from public;

grant tw_read_dev to dba;
grant tw_read_dev to lambda_dev;

-- TEST --

create database test;

create user lambda_test WITH LOGIN;
grant rds_iam TO lambda_test;

create role tw_read_test;
grant all on database test to tw_read_test;
revoke all on database test from public;

grant tw_read_test to dba;
grant tw_read_test to lambda_test;

-- PROD --

create database prod;

create user lambda_prod WITH LOGIN;
grant rds_iam TO lambda_prod;

create role tw_read_prod;
grant all on database prod to tw_read_prod;
revoke all on database prod from public;

grant tw_read_prod to dba;
grant tw_read_prod to lambda_prod;

