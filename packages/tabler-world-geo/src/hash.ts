import { createHash } from 'crypto';

export function hash(address: string) {
    return createHash('md5')
        .update(address.toLocaleLowerCase())
        .digest('hex');
}
