export function decodeIdentifier(token?: string) {
    // tslint:disable-next-line: possible-timing-attack
    if (token == null || token === '') {
        return undefined;
    }
    if (token.startsWith('CONV')) {
        return token;
    }
    return JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
}
