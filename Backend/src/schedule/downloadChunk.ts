import https from "https";
import { parse } from "url";
import { getKey } from "./apikey";

export type Chunk<T = any> = {
    data: T[],
    next?: string,
    total: number,
    offset:  number,
} | undefined;

async function configureOptions(url?: string, method?: string) {
    const options = {
        host: (process.env.api_host || process.env.API_HOST) as string,
        port: 443,
        path: `/v1/admin/contacts/?limit=${(process.env.api_pagesize || process.env.API_READ_BATCH)}`,
        method: method || 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    };

    const path = url || options.path;
    return {
        ...options,
        path,
        headers: {
            ...options.headers,
            Authorization: `Token ${process.env.API_KEY_PLAIN || await getKey()}`,
        }
    };
}

export async function downloadChunk(url?: string, method?: string, postdata?: string, tryCount: number = 0): Promise<Chunk> {
    try {
        const options = await configureOptions(url, method);
        console.log("Downloading from", method, options.path);

        return new Promise<Chunk>((resolve, reject) => {
            try {
                var req = https.request(options, async function (res) {
                    if (res.statusCode === 429 && tryCount < 2) {
                        const newTry = tryCount + 1;

                        console.log("Got 429, sleeping ", newTry, "s");
                        await new Promise((resolve) => setTimeout(resolve, newTry * 5000));
                        return await downloadChunk(url, method, postdata, newTry);
                    }

                    if (res.statusCode !== 200) {
                        return reject(new Error(`${res.statusCode} ${res.statusMessage}`));
                    }

                    let data = '';
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        data += chunk;
                    });

                    res.on('end', async () => {
                        try {
                            var json = JSON.parse(data);
                            console.log(json);

                            const results = [];
                            results.push(... (json.results || json));

                            const parsed = parse(options.path, true);
                            return resolve({
                                data: results,
                                next: json.next,
                                offset: (parsed.query
                                    ? parseInt(parsed.query.offset as string || "-1", 10)
                                    : -1) || -1,
                                total: json.count || -1,
                            });
                        } catch (eEnd) {
                            console.error("on end", eEnd);
                            return reject(eEnd);
                        }
                    });
                });

                req.on('error', function (requestFail) {
                    console.error("on error", requestFail);
                    return reject(requestFail);
                });

                if (postdata != null) {
                    req.write(postdata);
                }

                req.end();
            }
            catch (getFail) {
                console.error("get fail", getFail);
                return reject(getFail);
            }
        });
    }
    catch (outerFail) {
        console.error("outer fail", outerFail);
        return Promise.reject(outerFail);
    }
}