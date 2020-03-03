import { AuditEventName } from './AuditEventName';
import { AuditScreenName } from './AuditScreenName';
import { DevAnalytics } from './DevAnalytics';
import { IAnalyticsProvider } from './IAuditor';
import { logger } from './logger';
import { SceenAudit } from './SceenAudit';
import { TimerEvent } from './TimerEvent';
import { IAuditor, IAuditSubmit, Metrics, Params } from './Types';

// tslint:disable: function-name
export class Audit {
    static provider: IAnalyticsProvider = new DevAnalytics();

    static init(auditor: IAnalyticsProvider) {
        Audit.provider = auditor;
    }

    static updateUser(id?: string, attributes?: Params) {
        if (!Audit.provider) { return; }
        try {
            Audit.provider.updateUser(id, attributes);
        } catch (e) {
            logger.error('audit-user', e);
        }
    }

    static disable() {
        if (!Audit.provider) { return; }
    }

    static enable() {
        if (!Audit.provider) { return; }
    }

    static trackPageView(screen: AuditScreenName, attributes?: Params, metrics?: Metrics): void {
        if (!Audit.provider) { return; }

        try {
            Audit.provider.trackPageView(screen, attributes, metrics);
        } catch (e) {
            logger.error('audit-pageview', e);
        }
    }

    static trackEvent(event: AuditEventName, attributes?: Params, metrics?: Metrics): void {
        if (!Audit.provider) { return; }
        try {
            Audit.provider.trackEvent(event, attributes, metrics);
        } catch (e) {
            logger.error('audit-event', e);
        }
    }

    static trackAction(screen: AuditScreenName, action: string, attributes?: Params, metrics?: Metrics): void {
        if (!Audit.provider) { return; }

        try {
            Audit.provider.trackAction(screen, action, attributes, metrics);
        } catch (e) {
            logger.error('audit-action', e);
        }
    }

    static screen(name: AuditScreenName): IAuditor {
        return new SceenAudit(Audit.provider, name);
    }

    static timer(event: AuditEventName): IAuditSubmit {
        return new TimerEvent(Audit.provider, event);
    }
}
