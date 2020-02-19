import { Platform } from 'react-native';
import { WebApps } from '../LinkingHelper';
export function formatWebApp(app: WebApps) {
    switch (app) {
        case WebApps.Chrome:
            return 'Google Chrome';
        case WebApps.Default:
            return Platform.OS === 'ios' ? 'Safari' : 'Google Chrome';
        default:
            return app;
    }
}
