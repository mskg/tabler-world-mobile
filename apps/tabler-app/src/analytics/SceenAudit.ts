import { ActionNames } from './ActionNames';
import { AuditPropertyNames } from './AuditPropertyNames';
import { IAnalyticsProvider } from './IAuditor';
import { IAuditor, Metrics, Params } from './Types';

/**
 * Audit Screen usage
 */
export class SceenAudit implements IAuditor {
    metrics = {};
    params = {};

    constructor(private provider: IAnalyticsProvider, private screen: string) {
    }

    setParam(name: AuditPropertyNames, value: string | string[]) {
        this.params[name] = value;
    }

    increment(metric: string) {
        if (!this.metrics[metric]) {
            this.metrics[metric] = 0;
        }

        this.metrics[metric] = this.metrics[metric] + 1;
    }

    trackAction(action: ActionNames, params?: Params, metrics?: Metrics) {
        if (!this.provider) { return; }
        this.provider.trackAction(this.screen, action, params, metrics);
    }

    submit(params?: Params, metrics?: Metrics) {
        if (!this.provider) { return; }
        this.provider.trackPageView(
            this.screen,
            {
                ...this.params,
                ...(params || {}),
            },
            {
                ...this.metrics,
                ...(metrics || {}),
            },
        );
    }
}
