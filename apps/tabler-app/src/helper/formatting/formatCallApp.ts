import { CallApps } from '../LinkingHelper';
export function formatCallApp(app: CallApps) {
    switch (app) {
        case CallApps.Default:
            return 'Mobile Phone';
        default:
            return app;
    }
}
