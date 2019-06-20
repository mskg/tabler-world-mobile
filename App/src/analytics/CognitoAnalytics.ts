import Analytics from '@aws-amplify/analytics';
import { EventType } from "./EventType";
import { logger, Metrics, Params } from './Types';

export function trackPageView(screen: string, attributes?: Params, metrics?: Metrics): void {
    if (__DEV__) {
        logger.debug("Show Screen", screen, attributes);
        // return;
    }

    Analytics.record({
        name: `Show Screen`,
        attributes: {
            ...(attributes || {}),
            screen,
            eventType: EventType.PageView,
        },
        metrics: {
            ...(metrics || {}),
        }
    });
}

export function trackEvent(event: string, attributes?: Params, metrics?: Metrics): void {
    if (__DEV__) {
        logger.debug("Track Event", event);
        // return;
    }

    Analytics.record({
        name: "Event",
        attributes: {
            ...(attributes || {}),
            event,
            eventType: EventType.Event,
        },
        metrics: {
            ...(metrics || {}),
        }
    });
}

export function trackAction(screen: string, action: string, attributes?: Params, metrics?: Metrics): void {
    if (__DEV__) {
        logger.debug("Track Action", screen, action, attributes);
        // return;
    }

    Analytics.record({
        name: `Action on Screen`,
        attributes: {
            ...(attributes || {}),
            action,
            screen,
            eventType: EventType.Action,
        },
        metrics: {
            ...(metrics || {}),
        }
    });
}
