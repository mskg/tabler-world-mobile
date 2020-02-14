import { Notifications } from 'expo';
import { Platform } from 'react-native';
import { allowsPushNotifications } from './allowsPushNotifications';
import { Logger, Categories } from './Logger';

const logger = new Logger(Categories.Helpers.Badge);

// tslint:disable-next-line: export-name
export async function setBadgeNumber(val: number) {
    try {
        if (Platform.OS === 'ios') {
            const notifications = await allowsPushNotifications();
            if (notifications) {
                await Notifications.setBadgeNumberAsync(0);
            }
        }
    } catch (e) {
        logger.debug(e, 'setBadge', val);
    }
}

export async function getBadgeNumber(): Promise<number | undefined> {
    if (Platform.OS === 'ios') {
        const notifications = await allowsPushNotifications();

        if (notifications) {
            return await Notifications.getBadgeNumberAsync();
        }
    }

    return undefined;
}
