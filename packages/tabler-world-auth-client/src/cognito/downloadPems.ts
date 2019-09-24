import jwkToPem from 'jwk-to-pem';
import request from 'request';
import { PEMs } from './types';

let pems: PEMs | undefined;

export async function downloadPems(iss: string): Promise<PEMs> {
    if (pems) { return pems; }

    return new Promise((resolve, reject) => {
        // Download the JWKs and save it as PEM
        request(
            {
                url: `${iss}/.well-known/jwks.json`,
                json: true,
                // tslint:disable-next-line: no-function-expression
            },
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    pems = {};

                    const keys = body.keys;
                    // tslint:disable: prefer-for-of
                    // tslint:disable-next-line: no-increment-decrement
                    for (let i = 0; i < keys.length; i++) {
                        // tslint:disable-next-line: variable-name
                        const key_id = keys[i].kid;
                        const modulus = keys[i].n;
                        const exponent = keys[i].e;

                        // tslint:disable-next-line: variable-name
                        const key_type = keys[i].kty;

                        const jwk = { kty: key_type, n: modulus, e: exponent };
                        const pem = jwkToPem(jwk);

                        pems[key_id] = pem;
                    }

                    resolve(pems);
                } else {
                    reject(error || response);
                }
            });
    });
};
