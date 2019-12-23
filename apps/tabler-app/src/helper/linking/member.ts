
import { Linking } from 'expo';

export function makeMemberLink(id: number) {
    return Linking.makeUrl('/member', { id });
}

export function parseMemberLink(path: string, queryParams: any) {
    if (path != null && path.endsWith('member') && queryParams.id != null) {
        return {
            id: parseInt(queryParams.id, 10),
            valid: true,
        };
    }

    return {
        valid: false,
    };
}
