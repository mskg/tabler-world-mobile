
type VersionMap<T> = {
    default: () => T,
    [version: string]: () => T,
};

type Args<T> = {
    context: {
        // logger: ILogger,
        clientInfo: {
            version: string;
        },
    },

    mapVersion?: (version: string) => string,
    versions: VersionMap<T>,
};

// function parseVersion(version: string) {
//     const [major, minor, bugfix] = version.split('.').map((e) => parseInt(e, 10));
//     return {
//         major,
//         minor,
//         bugfix,
//     };
// }

export const olderEqualV12 = (version: string) => version.startsWith('1.1') || version.startsWith('1.0')
    ? 'old'
    : 'default';

export function byVersion<T>({ context: { clientInfo: { version } }, versions, mapVersion }: Args<T>): T {
    const mappedVersion = mapVersion ? mapVersion(version) : version;
    return (versions[mappedVersion] || versions.default)();
}

export const olderEqualV14 = (version: string) => version.startsWith('1.4') || version.startsWith('1.3') || version.startsWith('1.2') || version.startsWith('1.1') || version.startsWith('1.0')
    ? 'old'
    : 'default';
