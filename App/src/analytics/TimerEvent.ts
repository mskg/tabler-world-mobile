import { IAnalyticsProvider } from './IAuditor';
import { logger } from "./logger";
import { Metrics, Params } from './Types';

export class TimerEvent {
    start: number;

    constructor(
        private provider: IAnalyticsProvider,
        private event: string) {
        this.start = Date.now();
    }

    public submit(params?: Params, metrics?: Metrics) {
        if (!this.provider) { return; }

        try {
            this.provider.trackEvent(this.event, params, {
                ...(metrics || {}),
                duration: Date.now() - this.start,
            });
        }
        catch (e) {
            logger.error(e, "trackAction failed");
        }
    }
}
