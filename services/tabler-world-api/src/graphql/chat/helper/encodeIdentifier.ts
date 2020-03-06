export function encodeIdentifier(token?: any) {
    if (token == null) {
        return undefined;
    }
    return Buffer.from(JSON.stringify(token)).toString('base64');
}


