import { writeFileSync } from 'fs';
import { downloadChunk } from '../src/reader/helper/downloadChunk';
import { fetchParallel } from '../src/reader/helper/fetchParallel';

let fileName = 0;
async function handleChunk(data: any[]) {
    writeFileSync(__dirname + `/out-${++fileName}.json`, JSON.stringify(data, null, 4));
}

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

test().then(
    () => console.log('done'),
);
