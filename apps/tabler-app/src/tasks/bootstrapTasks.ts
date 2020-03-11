import { Features, isFeatureEnabled } from '../model/Features';
import { defineFetchTask, registerFetchTask } from './registerFetchTask';
import { registerForPushNotifications } from './registerForPushNotifications';
import { defineLocationTask, registerLocationTask } from './registerLocationTask';

// tslint:disable-next-line: export-name
export function bootstrapTasks() {
    defineFetchTask();
    defineLocationTask();
}

export async function runTasks() {
    await registerForPushNotifications();

    if (isFeatureEnabled(Features.BackgroundFetch)) {

        // tslint:disable-next-line: no-empty
        try { await registerFetchTask(); } catch { }
    }

    // tslint:disable-next-line: no-empty
    try { await registerLocationTask(); } catch { }
}
