import { xHttps } from '@mskg/tabler-world-aws';
import { StopWatch } from '@mskg/tabler-world-common';
import { RequestOptions } from 'https';
import createHttpsProxyAgent from 'https-proxy-agent';
import { Environment } from '../Environment';

export class HttpClient {
    // tslint:disable: variable-name
    private _maxTries = Environment.HttpClient.retries;
    private _waitTime = Environment.HttpClient.waitTime;
    private _headers: { [key: string]: string } = {};

    constructor(
        private host: string,
        private port = 443,
    ) {
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

    protected configureOptions(path: string, method: string): RequestOptions {
        const options: RequestOptions = {
            method,
            port: this.port,
            headers: {
                'Content-Type': 'application/json',
                ...this._headers,
            },
        };

        const proxy = Environment.HttpClient.proxy;
        if (proxy != null) {
            // @ts-ignore
            options.agent = createHttpsProxyAgent(proxy);
        }

        return {
            ...options,
            path,
            host: this.host,
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
            const run = this.run.bind(this);
            const stopWatch = new StopWatch();

            return new Promise<T>((resolve, reject) => {
                try {
                    const req = xHttps.request(options, (res) => {
                        if (res.statusCode === 429 && tryCount < maxTries - 1) {
                            const newTry = tryCount + 1;

                            // tslint:disable-next-line: insecure-random
                            const sleepTime = Math.pow(2, newTry - 1) * waitTime * Math.random();

                            console.log('[API] Got 429, try ', newTry, 'sleepTime', Math.round(sleepTime / 1000), 's');
                            setTimeout(
                                () => resolve(run(url, method, postdata, newTry)),
                                // tslint:disable-next-line: insecure-random
                                sleepTime,
                            );

                            return;
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
                            } finally {
                                console.debug('[API] Downloading from', options.host, options.port, options.path, options.method, 'took', stopWatch.elapsedMs, 'ms');
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
