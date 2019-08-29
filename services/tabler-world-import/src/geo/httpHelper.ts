import { xHttps as https } from "@mskg/tabler-world-aws";

function configureOptions(host: string, path: string, method?: string) {
    const options = {
        port: 443,
        method: method || 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    };

    return {
        ...options,
        host,
        path,
    };
}

export async function callAPI<T>(
    host: string,
    url: string,
    method: string = "GET",
    postdata?: string,

    maxTries: number = 1,
    tryCount: number = 0,
    waitTime: number = 5000,
): Promise<T> {
    try {
        const options = configureOptions(host, url, method);
        console.log("Downloading from", host, method, options.path);

        return new Promise<T>((resolve, reject) => {
            try {
                var req = https.request(options, async function (res) {
                    if (res.statusCode === 429 && tryCount < maxTries - 1) {
                        const newTry = tryCount + 1;

                        console.log("Got 429, sleeping ", newTry, "s");
                        await new Promise((resolve) => setTimeout(resolve, newTry * waitTime));
                        return await callAPI(host, url, method, postdata, maxTries, newTry, waitTime);
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
                            return resolve(json as T);
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