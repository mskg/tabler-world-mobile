import { trackEvent } from './CognitoAnalytics';
import { Metrics, Params } from './Types';

export class TimerEvent {
    start: number;
    constructor(private event: string) {
        this.start = Date.now();
    }
    public submit(params?: Params, metrics?: Metrics) {
        trackEvent(this.event, params, {
            ...(metrics || {}),
            duration: Date.now() - this.start,
        });
    }
}
