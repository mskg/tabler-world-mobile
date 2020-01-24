import { Linking } from 'expo';

export function makeMemberLink(id: number) {
    return Linking.makeUrl('/member', { id: id.toString() });
}
