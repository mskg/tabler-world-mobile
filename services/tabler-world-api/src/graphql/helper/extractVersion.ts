export const LATEST_VESION = '$LATEST';

function isApp(data: { [key: string]: string | undefined }): boolean {
    return data && data['x-client-name'] === 'TABLER.APP';
}

export function extractVersion(data: { [key: string]: string | undefined }): string {
    if (!isApp(data)) {
        return LATEST_VESION;
    }

    return data['x-client-version'] || LATEST_VESION;
}

export function extractPlatform(data: { [key: string]: string | undefined }): 'ios' | 'android' | undefined {
    // @ts-ignore
    return data && data['x-client-os'];
}

export function extractDeviceID(data: { [key: string]: string | undefined }): string | undefined {
    // @ts-ignore
    return data && data['x-client-device'];
}
