
import { Platform } from 'react-native';
import { MessagingApps } from '../LinkingHelper';

export function formatMessagingApp(app: MessagingApps) {
    switch (app) {
        // case MessagingApps.Signal:
        //     return "Signal Messenger";

        // case MessagingApps.Telegram:
        //     return "Telegram";

        case MessagingApps.WhatsApp:
            return 'WhatsApp';

        case MessagingApps.Default:
            return Platform.OS === 'ios' ? 'Apple Messages' : 'Google Messages';

        default:
            return app;
    }
}
