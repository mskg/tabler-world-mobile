import { xHttps } from '@mskg/tabler-world-aws';

export class HttpClient {
    private _maxTries = 3;
    private _waitTime = 5000;
    private _headers: { [key: string]: string } = {};

    constructor(private host: string, private port = 443) {
    }

    set maxTries(tries: number) {
        this._maxTries = tries;
    }

    set headers(headers: { [key: string]: string }) {
        this._headers = headers;
    }

    set waitTime(time: number) {
        this._waitTime = time;
    }

    public callApi<T>(
        url: string,
        method: string = 'GET',
        postdata?: string,
    ): Promise<T> {
        return this.run<T>(url, method, postdata);
    }

    protected configureOptions(path: string, method: string) {
        const options = {
            port: this.port,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...this._headers,
            },
        };

        return {
            ...options,
            host: this.host,
            path,
        };
    }

    protected run<T>(
        url: string,
        method: string,
        postdata?: string,
        tryCount: number = 0,
    ): Promise<T> {
        try {
            const options = this.configureOptions(url, method);
            console.debug('[API] Downloading from', options.host, options.port, options.path, options.method, postdata);

            const maxTries = this._maxTries;
            const waitTime = this._waitTime;
            const run = this.run;

            return new Promise<T>((resolve, reject) => {
                try {
                    const req = xHttps.request(options, async (res) => {
                        if (res.statusCode === 429 && tryCount < maxTries - 1) {
                            const newTry = tryCount + 1;

                            console.log('[API] Got 429, sleeping ', newTry, 's');
                            // tslint:disable-next-line: no-string-based-set-timeout
                            await new Promise((r) => setTimeout(r, newTry * waitTime));
                            return run(url, method, postdata, newTry);
                        }

                        if (res.statusCode !== 200) {
                            return reject(new Error(`${res.statusCode} ${res.statusMessage}`));
                        }

                        let data = '';
                        res.setEncoding('utf8');
                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        res.on('end', async () => {
                            try {
                                // console.debug('Received', data);

                                const json = JSON.parse(data);
                                return resolve(json as T);
                            } catch (eEnd) {
                                console.error('[API] on end', eEnd);
                                return reject(eEnd);
                            }
                        });
                    });

                    req.on('error', (requestFail) => {
                        console.error('[API] on error', requestFail);
                        return reject(requestFail);
                    });

                    if (postdata != null) {
                        req.write(postdata);
                    }

                    req.end();
                } catch (getFail) {
                    console.error('[API] get fail', getFail);
                    return reject(getFail);
                }
            });
        } catch (outerFail) {
            console.error('[API] outer fail', outerFail);
            return Promise.reject(outerFail);
        }
    }
}
