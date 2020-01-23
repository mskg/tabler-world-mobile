import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { AsyncStorage } from 'react-native';
import { Categories, Logger } from '../helper/Logger';
import { storePushToken } from '../redux/actions/settings';
import { getReduxStore } from '../redux/getRedux';
import { TOKEN_KEY } from './Constants';

const logger = new Logger(Categories.Sagas.Push);

export async function registerForPushNotifications() {
    // TODO: dupliacte code with checkPersmissions
    try {
        const { status: existingStatus } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS,
        );

        let finalStatus = existingStatus;

        // only ask if permissions have not already been determined, because
        // iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }

        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
            logger.log('status', finalStatus);
            return;
        }

        const existingToken = await AsyncStorage.getItem(TOKEN_KEY);

        // Get the token that uniquely identifies this device
        const token = await Notifications.getExpoPushTokenAsync();

        if (token != existingToken) {
            logger.log('token is', token);
            getReduxStore().dispatch(storePushToken(token));
        } else {
            logger.log('Token known', existingToken);
        }
    } catch (e) {
        logger.error(e, 'Failed to acquire push token');
    }
}
