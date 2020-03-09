import { createHash } from 'crypto';
import { randomBytes, secretbox } from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { EncryptedValue } from '../types/EncryptedValue';
import { IEncryptionManager, IEncryptionWorker } from '../types/IEncryptionManager';

async function encrypt(key: Uint8Array, data: string): Promise<EncryptedValue> {
    const nonceBytes = randomBytes(24);

    const ciphertextBytes = secretbox(
        decodeUTF8(data),
        nonceBytes,
        key,
    );

    return {
        nonce: encodeBase64(nonceBytes),
        ciphertext: encodeBase64(ciphertextBytes),
    };
}

async function decrypt(key: Uint8Array, data: EncryptedValue): Promise<string> {
    const bytes = secretbox.open(
        decodeBase64(data.ciphertext),
        decodeBase64(data.nonce),
        key,
    );

    if (!bytes) { return ''; }
    return encodeUTF8(bytes);
}

class Worker implements IEncryptionWorker {
    constructor(private key: Uint8Array) {
    }

    public async encrypt(data: any): Promise<EncryptedValue> {
        return encrypt(this.key, JSON.stringify(data));
    }

    public async decrypt<T>(data: EncryptedValue): Promise<T> {
        const decrypted = await decrypt(this.key, data);
        return JSON.parse(decrypted);
    }
}

type KeyFunc = () => Promise<string>;
// tslint:disable-next-line: max-classes-per-file
export class TweetNaClEnryptionManager implements IEncryptionManager {
    constructor(private masterKey: KeyFunc) { }

    async createWorker(conversation: string): Promise<IEncryptionWorker> {
        const hash = createHash('sha256')
            .update(conversation + await this.masterKey())
            .digest();

        const base64 = Buffer.from(hash).toString('base64');
        return Promise.resolve(new Worker(decodeBase64(base64)));
    }
}
