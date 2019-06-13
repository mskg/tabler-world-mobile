import { config, KMS } from 'aws-sdk';

config.update({ region: 'eu-west-1' });

const encrypted = process.env['api_key'];
let decrypted: string;

export function getKey(): Promise<string> {
    if (decrypted) {
        return Promise.resolve(decrypted);
    } else {
        if (encrypted == null || encrypted === "") {
            throw new Error("Key missing");
        }

        return new Promise<string>((resolve, reject) => {
            const kms = new KMS();
            kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (kmsErr, kmsData) => {
                if (kmsErr) {
                    console.log('Decrypt error:', kmsErr);
                    reject(kmsErr);
                }

                if (kmsData == null || kmsData.Plaintext == null || kmsData.Plaintext === "") {
                    reject(new Error("No key after decryption"));
                } else {
                    decrypted = kmsData.Plaintext.toString();
                    resolve(decrypted);
                }
            });
        });
    }
};