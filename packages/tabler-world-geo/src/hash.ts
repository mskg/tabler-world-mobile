import crypto from 'crypto';
export function hash(address: string) {
    return crypto
        .createHash('md5')
        .update(address.toLocaleLowerCase())
        .digest('hex');
}
