import { trackAction, trackPageView } from './CognitoAnalytics';
import { IAuditor, Metrics, Params } from './Types';

/**
 * Audit Screen usage
 */
export class SceenAudit implements IAuditor {
    metrics = {};
    params = {};

    constructor(private screen: string) {
    }

    public setParam(name: string, value: string | string[]) {
        this.params[name] = value;
    }

    public increment(metric: string) {
        if (!this.metrics[metric]) {
            this.metrics[metric] = 0;
        }

        this.metrics[metric] = this.metrics[metric] + 1;
    }

    public trackAction(action: string, params?: Params, metrics?: Metrics) {
        trackAction(this.screen, action, params, metrics);
    }

    public submit(params?: Params, metrics?: Metrics) {
        trackPageView(this.screen, {
            ...this.params,
            ...(params || {})
        }, {
            ...this.metrics,
            ...(metrics || {})
        });
    }
}
