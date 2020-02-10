SET ROLE tw_read_dev;



select r->>'sector', count(*), jsonb_agg(id)
from (
select jsonb_array_elements(companies) as r, id
from profiles
) companies
group by r->>'sector'
order by 2


select *
from (
select jsonb_array_elements(companies) as r, id
from profiles
) companies
where r->>'sector' = 'CONSULTING'


select *
from profiles where id = 123640


1	Insurance	1	[145681]
2	Construction	1	[123667]
4	Import/export	1	[145679]
5	Real Estate	1	[145693]
6	HR	1	[145690]
7	Legal	1	[145696]
8	FMCG / Industrial / Luxury goods	1	[123647]
9	SHIPPING	1	[123641]
10	CONSULTING	1	[123640]
11	Web Marketing	2	[145685,145698]
12	Medical	2	[145684,145686]
13	Informatics	2	[145680,145682]
14	Finance	2	[145683,145688]
15	IT	2	[123666,123664]
16	Automobile	2	[145692,145694]
17	Textile	2	[145689,145687]

