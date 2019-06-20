import { AuditEventName } from './AuditEventName';
import { AuditScreenName } from './AuditScreenName';
import { trackAction, trackEvent, trackPageView } from './CognitoAnalytics';
import { SceenAudit } from "./SceenAudit";
import { TimerEvent } from "./TimerEvent";
import { IAuditor, IAuditSubmit, Metrics, Params } from './Types';

export class Audit {
    public static trackPageView(screen: AuditScreenName, attributes?: Params, metrics?: Metrics): void {
        trackPageView(screen, attributes, metrics);
    }

    public static trackEvent(event: AuditEventName, attributes?: Params, metrics?: Metrics): void {
        trackEvent(event, attributes, metrics);
    }

    public static trackAction(screen: AuditScreenName, action: string, attributes?: Params, metrics?: Metrics): void {
        trackAction(screen, action, attributes, metrics);
    }

    public static screen(name: AuditScreenName): IAuditor {
        return new SceenAudit(name);
    }

    public static timer(event: AuditEventName): IAuditSubmit {
        return new TimerEvent(event);
    }
}
