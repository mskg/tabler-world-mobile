import { writeFileSync } from 'fs';
import { downloadChunk } from '../src/reader/helper/downloadChunk';
import { fetchParallel } from '../src/reader/helper/fetchParallel';

let fileName = 0;
async function handleChunk(data: any[]) {
    writeFileSync(__dirname + `/out-${++fileName}.json`, JSON.stringify(data, null, 4));
}

async function test() {
    const url = 'https://api.rti.roundtable.world/v1/admin/levels/clubs/?';
    const payload = undefined;
    // const payload = null; JSON.stringify({
    //     "operator": "AND",
    //     "last_modified": "2010-01-01",
    // });
    const method = 'GET';

    const firstChunk = await downloadChunk(url, method, payload);
    if (firstChunk != null) {
        await handleChunk(firstChunk.data);
        await fetchParallel(firstChunk, handleChunk, method, payload);
    }
}

console.log('***************', process.env.STAGE);

test().then(
    () => console.log('done'),
);
