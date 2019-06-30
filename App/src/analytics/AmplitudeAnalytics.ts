import * as Amplitude from 'expo-analytics-amplitude';
import { AuditPropertyNames } from './AuditPropertyNames';
import { EventType } from "./EventType";
import { IAnalyticsProvider } from './IAuditor';
import { logger } from "./logger";
import { Metrics, Params } from './Types';

const ensureStrings = (o: any) => {
    if (o == null) return null;

    const result = {};

    Object.keys(o).forEach(key => {
        let val = o[key];

        if (typeof(val) !== "string") {
            val = val.toString();
        }

        if (val !== null) {
            result[key] = val;
        }
    });

    return Object.keys(result).length > 0 ? result : null;
}

export class AmplitudeAnalytics implements IAnalyticsProvider {
    disabled: boolean = false;

    constructor(apiKey: string) {
        logger.log("Boostrapping AmplitudeAnalytics");
        Amplitude.initialize(apiKey);
    }

    enable() {
        this.disabled = false;
    }

    disable() {
        this.disabled = true;
    }

    updateUser(id: string, attributes?: Params) {
        if (this.disabled) { return; }

        if (id != null) {
            // ensure it's a string
            Amplitude.setUserId("" + id);
        }

        const reduced = ensureStrings(attributes);
        if (reduced) {
            delete reduced[AuditPropertyNames.Version];
            Amplitude.setUserProperties(reduced);
        }
    }

    trackPageView(screen: string, attributes?: Params, metrics?: Metrics): void {
        if (this.disabled) { return; }

        Amplitude.logEventWithProperties(
            `View ${screen}`,
            {
                ...(ensureStrings(attributes) || {}),
                ...(ensureStrings(metrics) || {}),

                [AuditPropertyNames.EventType]: EventType.PageView,
                // [AuditPropertyNames.View]: screen,
            }
        );
    }

    trackEvent(event: string, attributes?: Params, metrics?: Metrics): void {
        if (this.disabled) { return; }

        Amplitude.logEventWithProperties(
            `Event ${event}`,
            {
                ...(ensureStrings(attributes) || {}),
                ...(ensureStrings(metrics) || {}),

                // [AuditPropertyNames.Event]: event,
                [AuditPropertyNames.EventType]: EventType.Event,
            }
        );
    }

    trackAction(screen: string, action: string, attributes?: Params, metrics?: Metrics): void {
        if (this.disabled) { return; }

        Amplitude.logEventWithProperties(
            `Action ${screen} ${action}`,
            {
                ...(ensureStrings(attributes) || {}),
                ...(ensureStrings(metrics) || {}),

                // [AuditPropertyNames.Action]: action,
                [AuditPropertyNames.View]: screen,
                [AuditPropertyNames.EventType]: EventType.Action,
            }
        );
    }
}