import { removeEmptySlots } from '@mskg/tabler-world-common';
import { request } from 'https';
import querystring from 'querystring';
import { getI18NParameters } from '../helper/getI18NParameters';

type POEResponse = {
    response: {
        status: string,
        code: number,
        message: string,
    },

    result: {
        terms: POETerm[],
    } & {
        languages: POELanguage[],
    },
};

export type POELanguage = {
    name: string,
    code: string,
    translations: number,
    percentage: number,
    updated: Date,
};

export type POETerm = {
    term: string,
    context?: string,
    plural?: string,
    created: Date,
    updated: Date | string,
    translation: {
        content: string,
        fuzzy: boolean,
        proofread: boolean,
        updated: Date,
    },
    reference?: string,
    tags?: string[],
    comment?: string,
};

export class POEditorApi {
    // tslint:disable-next-line: function-name
    public static async call(path: string, rawPostData: any = {}): Promise<POEResponse> {
        const config = await getI18NParameters();

        return new Promise((resolve, reject) => {
            const postData = querystring.stringify({
                ...rawPostData,
                api_token: config.poeditor.token,
                id: config.poeditor.id,
            });

            const req = request(
                {
                    host: config.poeditor.host,
                    port: 443,
                    method: 'POST',
                    path,
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
                            return resolve(removeEmptySlots(json));
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
        });
    }
}
