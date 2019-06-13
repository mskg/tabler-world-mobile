import { trackAction, trackEvent, trackPageView } from './CognitoAnalytics';
import { SceenAudit } from "./SceenAudit";
import { TimerEvent } from "./TimerEvent";
import { IAuditor, IAuditSubmit, Metrics, Params } from './Types';

export class Audit {
    public static trackPageView(screen: string, attributes?: Params, metrics?: Metrics): void {
        trackPageView(screen, attributes, metrics);
    }

    public static trackEvent(event: string, attributes?: Params, metrics?: Metrics): void {
        trackEvent(event, attributes, metrics);
    }

    public static trackAction(screen: string, action: string, attributes?: Params, metrics?: Metrics): void {
        trackAction(screen, action, attributes, metrics);
    }

    public static screen(name: string): IAuditor {
        return new SceenAudit(name);
    }

    public static timer(event: string): IAuditSubmit {
        return new TimerEvent(event);
    }
}
