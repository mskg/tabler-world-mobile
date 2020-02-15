
import { Platform } from 'react-native';
import { MailApps } from '../LinkingHelper';

export function formatMailApp(app: MailApps) {
    switch (app) {
        case MailApps.Default:
            return Platform.OS === 'ios' ? 'Apple Mail' : 'Google Mail';

        case MailApps.GoogleMail:
            return 'Google Mail';

        case MailApps.Outlook:
            return 'Microsoft Outlook';

        default:
            return app;
    }
}
