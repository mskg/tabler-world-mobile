import Analytics from '@aws-amplify/analytics';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { EventType } from "./EventType";
import { IAnalyticsProvider } from './IAuditor';
import { logger } from "./logger";
import { Metrics, Params } from './Types';

export class CognitoAnalytics implements IAnalyticsProvider {
    constructor(region: string, appId: string) {
        logger.log("Boostrapping CognitoAnalytics");

        Analytics.configure({
            autoSessionRecord: true,

            AWSPinpoint: {
                appId,
                region,
            }
        });
    }

    enable() {
        Analytics.enable();
    }

    disable() {
        Analytics.disable();
    }

    updateUser(id: string, attributes?: Params) {
        Analytics.updateEndpoint({
            address: id || Constants.installationId,

            attributes: attributes || {},

            demographic: {
                appVersion: Constants.manifest.revisionId,

                platform: Platform.OS,
                platformVersion: Platform.Version,

                modelVersion: (Constants.deviceYearClass || 0).toString(),
            },
        });
    }

    trackPageView(screen: string, attributes?: Params, metrics?: Metrics): void {
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

    trackEvent(event: string, attributes?: Params, metrics?: Metrics): void {
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

    trackAction(screen: string, action: string, attributes?: Params, metrics?: Metrics): void {
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
}