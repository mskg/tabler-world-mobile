import { AuditEventName } from './AuditEventName';
import { AuditScreenName } from './AuditScreenName';
import { DevAnalytics } from './DevAnalytics';
import { IAnalyticsProvider } from './IAuditor';
import { logger } from "./logger";
import { SceenAudit } from "./SceenAudit";
import { TimerEvent } from "./TimerEvent";
import { IAuditor, IAuditSubmit, Metrics, Params } from './Types';

export class Audit {
    static provider: IAnalyticsProvider = new DevAnalytics();

    public static init(auditor: IAnalyticsProvider) {
        Audit.provider = auditor;
    }

    public static updateUser(id?: string, attributes?: Params) {
        if (!Audit.provider) { return; }
        try {
            Audit.provider.updateUser(id, attributes);
        }
        catch (e) {
            logger.error(e, "updateUser failed");
        }
    }

    public static disable() {
        if (!Audit.provider) { return; }
    }

    public static enable() {
        if (!Audit.provider) { return; }
    }

    public static trackPageView(screen: AuditScreenName, attributes?: Params, metrics?: Metrics): void {
        if (!Audit.provider) { return; }

        try {
            Audit.provider.trackPageView(screen, attributes, metrics);
        }
        catch (e) {
            logger.error(e, "trackPageView failed");
        }
    }

    public static trackEvent(event: AuditEventName, attributes?: Params, metrics?: Metrics): void {
        if (!Audit.provider) { return; }
        try {
            Audit.provider.trackEvent(event, attributes, metrics);
        }
        catch (e) {
            logger.error(e, "trackEvent failed");
        }
    }

    public static trackAction(screen: AuditScreenName, action: string, attributes?: Params, metrics?: Metrics): void {
        if (!Audit.provider) { return; }

        try {
            Audit.provider.trackAction(screen, action, attributes, metrics);
        }
        catch (e) {
            logger.error(e, "trackAction failed");
        }
    }

    public static screen(name: AuditScreenName): IAuditor {
        return new SceenAudit(Audit.provider, name);
    }

    public static timer(event: AuditEventName): IAuditSubmit {
        return new TimerEvent(Audit.provider, event);
    }
}
