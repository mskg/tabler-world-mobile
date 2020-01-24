import { writeFileSync } from 'fs';
import { downloadChunk } from '../src/reader/helper/downloadChunk';
import { fetchParallel } from '../src/reader/helper/fetchParallel';
import { gunzipAsync, gzipAsync } from '../src/reader/helper/gzip';

let fileName = 0;
async function handleChunk(data: any[]) {
    writeFileSync(__dirname + `/out-${++fileName}.json`, JSON.stringify(data, null, 4));
}

// @ts-ignore
async function test() {
    const url = 'https://api.roundtable.world/v1/admin/groups/?';

    const payload = undefined;
    // JSON.stringify({
    //     operator: 'AND',
    //     last_modified: '2020-01-01',
    // });

    const method = 'GET';
    // const method = 'POST';

    const firstChunk = await downloadChunk(url, method, payload);
    if (firstChunk != null) {
        await handleChunk(firstChunk.data);
        await fetchParallel(firstChunk, handleChunk, method, payload);
    }
}

// @ts-ignore
async function test2() {
    const data = { a: 'b', c: 'd', e: 3 };

    const zipBuffer = await gzipAsync(Buffer.from(JSON.stringify(data)));
    console.log('zipBuffer', zipBuffer);

    const buffer = zipBuffer.toString('binary');

    const unzipBuffer = Buffer.from(buffer, 'binary');
    console.log('unzipBuffer', unzipBuffer);

    const unZipped = await gunzipAsync(unzipBuffer);
    console.log('unZipped', JSON.parse(unZipped.toString()));
}

test().then(
    () => console.log('done'),
);
