import * as Linking from 'expo-linking';

export function makeMemberLink(id: number) {
    return Linking.makeUrl('/member', { id: id.toString() });
}
