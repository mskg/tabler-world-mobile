import request = require("request");
import { PEMs } from "./types";
import jwkToPem from "jwk-to-pem";

var pems: PEMs | undefined;

export async function downloadPems(iss: string): Promise<PEMs> {
    if (pems) return pems;

    return new Promise((resolve, reject) => {
        //Download the JWKs and save it as PEM
        request({
            url: iss + '/.well-known/jwks.json',
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                pems = {};
                
                var keys = body['keys'];
                for (var i = 0; i < keys.length; i++) {
                    //Convert each key to PEM
                    var key_id = keys[i].kid;
                    var modulus = keys[i].n;
                    var exponent = keys[i].e;
                    var key_type = keys[i].kty;
                    var jwk = { kty: key_type, n: modulus, e: exponent };
                    var pem = jwkToPem(jwk);
                    pems[key_id] = pem;
                }

                resolve(pems);
            } else {
                reject(error || response);
            }
        });

        return pems;
    });
};