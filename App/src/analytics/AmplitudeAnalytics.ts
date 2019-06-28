import * as Amplitude from 'expo-analytics-amplitude';
import { EventType } from "./EventType";
import { IAnalyticsProvider } from './IAuditor';
import { logger } from "./logger";
import { Metrics, Params } from './Types';

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
            Amplitude.setUserId(id);
        }

        if (attributes) {
            Amplitude.setUserProperties(attributes);
        }
    }

    trackPageView(screen: string, attributes?: Params, metrics?: Metrics): void {
        if (this.disabled) { return; }

        Amplitude.logEventWithProperties(
            `View ${screen}`,
            {
                ...(attributes || {}),
                ...(metrics || {}),

                eventType: EventType.PageView,
                screen,
            }
        );
    }

    trackEvent(event: string, attributes?: Params, metrics?: Metrics): void {
        if (this.disabled) { return; }

        Amplitude.logEventWithProperties(
            `Event ${event}`,
            {
                ...(attributes || {}),
                ...(metrics || {}),

                eventType: EventType.Event,
                event,
            }
        );
    }

    trackAction(screen: string, action: string, attributes?: Params, metrics?: Metrics): void {
        if (this.disabled) { return; }

        Amplitude.logEventWithProperties(
            `View ${action} ${action}`,
            {
                ...(attributes || {}),
                ...(metrics || {}),

                action,
                screen,
                eventType: EventType.Action,
            }
        );
    }
}