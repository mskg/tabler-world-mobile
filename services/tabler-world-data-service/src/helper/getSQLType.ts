export function getSQLType(p: any) {
    const t = typeof (p);
    if (t === 'object') return 'jsonb';
    if (t === 'bigint') return 'numeric';
    if (t === 'number') return 'numeric';
    if (t === 'boolean') return 'bool';

    return 'text';
}