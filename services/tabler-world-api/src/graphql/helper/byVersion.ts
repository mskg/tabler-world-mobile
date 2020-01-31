
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

export const v12Check = (version: string) => version.startsWith('1.1') || version.startsWith('1.0')
    ? 'old'
    : 'default';

export function byVersion<T>({ context: { clientInfo: { version } }, versions, mapVersion }: Args<T>): T {
    const mappedVersion = mapVersion ? mapVersion(version) : version;
    return (versions[mappedVersion] || versions.default)();
}
