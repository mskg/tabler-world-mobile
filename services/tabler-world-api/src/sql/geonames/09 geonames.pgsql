SET ROLE 'tw_read_dev';

------------------------------
-- Address history
------------------------------

-- country code      : iso country code, 2 characters
-- postal code       : varchar(20)
-- place name        : varchar(180)
-- admin name1       : 1. order subdivision (state) varchar(100)
-- admin code1       : 1. order subdivision (state) varchar(20)
-- admin name2       : 2. order subdivision (county/province) varchar(100)
-- admin code2       : 2. order subdivision (county/province) varchar(20)
-- admin name3       : 3. order subdivision (community) varchar(100)
-- admin code3       : 3. order subdivision (community) varchar(20)
-- latitude          : estimated latitude (wgs84)
-- longitude         : estimated longitude (wgs84)
-- accuracy          : accuracy of lat/lng from 1=estimated, 4=geonameid, 6=centroid of addresses or shape

-- Import
-- \copy geo_postalcodes (countrycode, postalcode, name, name1, code1, name2, code2, name3, code3, latitude, longitude, accuracy) from '~/Downloads/allCountries.txt' NULL as '';

CREATE TABLE IF NOT EXISTS geo_postalcodes
(
    countrycode char(2),
    postalcode varchar(20),
    placename varchar(180),
    name1 varchar(100),
    code1 varchar(20),
    name2 varchar(100),
    code2 varchar(20),
    name3 varchar(100),
    code3 varchar(20),
    latitude real,
    longitude real,
    accuracy smallint
);

-- select count(*) from geo_postalcodes
-- delete from geo_postalcodes


-- drop table geonames
-- CREATE TABLE IF NOT EXISTS geonames (
--     geonameid           integer primary key
--     ,name               text
--     ,asciiname          text
--     ,alternatenames     text
--     ,latitude           numeric(13,5)
--     ,longitude          numeric(13,5)
--     ,feature_class      text
--     ,feature_code       text
--     ,country            text
--     ,cc2                text
--     ,admin1             text
--     ,admin2             bigint
--     ,admin3             bigint
--     ,admin4             bigint
--     ,population         bigint
--     ,elevation          bigint
--     ,dem                bigint
--     ,timezone           text
--     ,modification date
-- );