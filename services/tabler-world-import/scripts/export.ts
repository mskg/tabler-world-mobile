import { useDatabase } from '@mskg/tabler-world-rds-client';
import { writeFileSync } from 'fs';
import { createWriteToDatabaseHandler } from '../src/reader/helper/createWriteToDatabaseHandler';
import { downloadChunk } from '../src/reader/helper/downloadChunk';
import { fetchParallel } from '../src/reader/helper/fetchParallel';
import { JobType } from '../src/reader/types/JobType';
import { TargetTypes } from '../src/reader/types/TargetType';


let fileName = 0;
// async function handleChunk(data: any[]) {
//     // tslint:disable-next-line: prefer-template
//     appendFileSync(__dirname + `/out.txt`, '\n' + data.map((d) => d.id).join('\n'));
// }

async function handleChunk(data: any[]) {
    writeFileSync(`${__dirname}/out-${++fileName}.json`, JSON.stringify(data, null, 4));
}

function createHandler(db = true) {
    if (db) { return createWriteToDatabaseHandler(JobType.members); }
    return handleChunk;
}

// @ts-ignore
async function test2() {
    await useDatabase({ logger: console }, async (c) => {
        const result = await c.query('select count(*) from tabler');
        console.log(result.rows);
    });
}

// @ts-ignore
async function test() {
    // const url = 'https://api.roundtable.world/v1/admin/groups/?';
    // const url = 'https://api.roundtable.world/v1/admin/levels/all/?';
    const url = 'https://api.roundtable.world/v1/admin/contacts/?';

    const payload = undefined;
    // JSON.stringify({
    //     operator: 'AND',
    //     last_modified: '2020-01-01',
    // });

    const method = 'GET';
    // const method = 'POST';

    const handler = createHandler();
    const target: TargetTypes = 'c41';

    const firstChunk = await downloadChunk(target, url, 25, method, payload);
    if (firstChunk != null) {
        await handler(firstChunk.data);
        await fetchParallel(target, firstChunk, handler, 25, method, payload);
    }
}

test()
    .then(
        () => console.log('done'),
    );
