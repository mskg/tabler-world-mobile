import * as Permissions from 'expo-permissions';

export async function allowsPushNotifications() {
    try {
        const { status: existingStatus } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS,
        );

        return existingStatus === 'granted';
    } catch {
        return false;
    }
}
