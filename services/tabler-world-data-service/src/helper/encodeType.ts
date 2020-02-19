export function encodeType(p: any) {
    const t = typeof (p);

    if (t === 'object') { return `'${JSON.stringify(p)}'`; }
    if (t === 'bigint') { return p; }
    if (t === 'number') { return p; }
    if (t === 'boolean') { return p; }

    return `'${p}'`;
}
