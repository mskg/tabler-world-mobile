SET ROLE 'tw_read_dev';

update clubs
set id = 'rti_' || id
;

update areas
set id = 'rti_' || id
;

update associations
set id = 'rti_' || id
;   