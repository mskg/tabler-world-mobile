import { removeEmptySlots } from '@mskg/tabler-world-common';
import { request } from 'https';
import querystring from 'querystring';
import { IApolloContext } from '../types/IApolloContext';

// tslint:disable: export-name
// tslint:disable: variable-name
export const TranslationsResolver = {
    Query: {
        Languages: async (_root: any, _params: any, _context: IApolloContext) => {
            const answer: any = await new Promise(
                (resolve, reject) => {
                    const postData = querystring.stringify({
                        api_token: 'baba19bf83fbfc606eee6649a7c3cd30',
                        id: 317857,
                    });

                    const req = request(
                        {
                            host: 'api.poeditor.com',
                            port: 443,
                            method: 'POST',
                            path: '/v2/languages/list',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Content-Length': postData.length,
                            },
                        },
                        (res) => {
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
                                    const json = JSON.parse(data);
                                    return resolve(json);
                                } catch (eEnd) {
                                    return reject(eEnd);
                                }
                            });
                        },
                    );

                    req.on('error', (requestFail) => {
                        console.error('[API] on error', requestFail);
                        return reject(requestFail);
                    });

                    req.write(postData);
                    req.end();
                },
            );

            return answer.result.languages.map((l: any) => {
                return l.code;
            });
        },

        Translations: async (_root: any, { language }: any, _context: IApolloContext) => {
            // tslint:disable-next-line: no-unnecessary-local-variable
            const answer: any = await new Promise(
                (resolve, reject) => {
                    const postData = querystring.stringify({
                        language: language || 'en',
                        api_token: 'baba19bf83fbfc606eee6649a7c3cd30',
                        id: 317857,
                    });

                    const req = request(
                        {
                            host: 'api.poeditor.com',
                            port: 443,
                            method: 'POST',
                            path: '/v2/terms/list',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Content-Length': postData.length,
                            },
                        },
                        (res) => {
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
                                    const json = JSON.parse(data);
                                    return resolve(json);
                                } catch (eEnd) {
                                    return reject(eEnd);
                                }
                            });
                        },
                    );

                    req.on('error', (requestFail) => {
                        console.error('[API] on error', requestFail);
                        return reject(requestFail);
                    });

                    req.write(postData);
                    req.end();
                },
            );

            const translations: any = {};

            for (const term of answer.result.terms) {
                let newValue;

                if (term.translation.content === '' || term.translation.content === null) {
                    continue;
                }

                if (typeof (term.translation.content) === 'object') {
                    newValue = removeEmptySlots(term.translation.content);

                    if (Object.keys(newValue).length === 0) {
                        continue;
                    }
                } else {
                    newValue = term.translation.content;
                }

                let v: any;

                term.context.split('.').forEach((c: string) => {
                    // tslint:disable-next-line: no-parameter-reassignment
                    c = c.substring(1, c.length - 1);

                    if (!translations[c]) {
                        translations[c] = {};
                    }

                    v = translations[c];
                });

                v[term.term] = newValue;
            }

            return translations;
        },
    },
};
