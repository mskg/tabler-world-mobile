import { ActionNames } from './ActionNames';
import { AuditPropertyNames } from './AuditPropertyNames';
import { IAnalyticsProvider } from './IAuditor';
import { logger } from "./logger";
import { IAuditor, Metrics, Params } from './Types';

/**
 * Audit Screen usage
 */
export class SceenAudit implements IAuditor {
    metrics = {};
    params = {};

    constructor(private provider: IAnalyticsProvider, private screen: string) {
    }

    public setParam(name: AuditPropertyNames, value: string | string[]) {
        this.params[name] = value;
    }

    public increment(metric: string) {
        if (!this.metrics[metric]) {
            this.metrics[metric] = 0;
        }

        this.metrics[metric] = this.metrics[metric] + 1;
    }

    public trackAction(action: ActionNames, params?: Params, metrics?: Metrics) {
        if (!this.provider) { return; }

        try {
            this.provider.trackAction(this.screen, action, params, metrics);
        }
        catch (e) {
            logger.error(e, "trackAction failed");
        }
    }

    public submit(params?: Params, metrics?: Metrics) {
        if (!this.provider) { return; }

        try {
            this.provider.trackPageView(this.screen, {
                ...this.params,
                ...(params || {})
            }, {
                    ...this.metrics,
                    ...(metrics || {})
                });
        }
        catch (e) {
            logger.error(e, "trackAction failed");
        }
    }
}
