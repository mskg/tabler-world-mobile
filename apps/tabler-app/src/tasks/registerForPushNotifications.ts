import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import AsyncStorage from '@react-native-community/async-storage';
import { Categories, Logger } from '../helper/Logger';
import { notificationState, storePushToken } from '../redux/actions/settings';
import { getReduxStore } from '../redux/getRedux';
import { removePushToken } from '../sagas/tokens/removePushToken';
import { TOKEN_KEY } from './Constants';
import { isSignedIn } from './helper/isSignedIn';

const logger = new Logger(Categories.Sagas.Push);

export async function registerForPushNotifications(force = false) {
    try {
        // if we are running in debug mode, we enable notifications
        if (!Constants.isDevice && Constants.manifest.releaseChannel == null) {
            getReduxStore().dispatch(notificationState(true));
            return;
        }

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

        const existingToken = await AsyncStorage.getItem(TOKEN_KEY);

        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
            logger.log('status', finalStatus);

            getReduxStore().dispatch(notificationState(false));
            if (isSignedIn()) {
                await removePushToken();
            }

            return;
        }

        // Get the token that uniquely identifies this device
        const token = await Notifications.getExpoPushTokenAsync();

        // tslint:disable-next-line: possible-timing-attack
        if (token.data !== existingToken || force) {
            logger.log('token is', token);
            getReduxStore().dispatch(notificationState(false));
            getReduxStore().dispatch(storePushToken(token.data));
            getReduxStore().dispatch(notificationState(true));
        } else {
            getReduxStore().dispatch(notificationState(true));
            logger.log('Token known', existingToken);
        }
    } catch (e) {
        logger.error('task-push', e);
    }
}
