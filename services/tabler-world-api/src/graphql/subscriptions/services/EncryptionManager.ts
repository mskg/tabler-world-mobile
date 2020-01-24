import * as crypto from 'crypto';
import { randomBytes, secretbox } from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { getChatParams } from '../utils/getChatParams';

export type EncodedValue = {
    nonce: string,
    ciphertext: string,
};

export class EncryptionManager {
    // tslint:disable-next-line: function-name
    private static async encrypt(key: Uint8Array, data: string): Promise<EncodedValue> {
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

    // tslint:disable-next-line: function-name
    private static async decrypt(key: Uint8Array, data: EncodedValue): Promise<string> {
        const bytes = secretbox.open(
            decodeBase64(data.ciphertext),
            decodeBase64(data.nonce),
            key,
        );

        if (!bytes) { return ''; }
        return encodeUTF8(bytes);
    }

    // tslint:disable-next-line: function-name
    private static async getEncryptionKey(conversation: string): Promise<string> {
        const params = await getChatParams();

        const hash = crypto
            .createHash('sha256')
            .update(conversation + params.masterKey)
            .digest();

        return Buffer.from(hash).toString('base64');
    }

    private key: Promise<Uint8Array>;

    constructor(conversastion: string) {
        this.key = EncryptionManager.getEncryptionKey(conversastion).then((r) => decodeBase64(r));
    }

    public async encrypt(data: any): Promise<EncodedValue> {
        return EncryptionManager.encrypt(await this.key, JSON.stringify(data));
    }

    public async decrypt<T>(data: EncodedValue): Promise<T> {
        const decrypted = await EncryptionManager.decrypt(await this.key, data);
        return JSON.parse(decrypted);
    }
}
