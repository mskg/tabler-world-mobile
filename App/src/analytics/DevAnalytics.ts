import { IAnalyticsProvider } from './IAuditor';
import { logger } from './logger';
import { Metrics, Params } from './Types';

export class DevAnalytics implements IAnalyticsProvider {
    enable(): void {
        if (__DEV__) { logger.debug('enable'); }
    }

    disable(): void {
        if (__DEV__) { logger.debug('disable'); }
    }

    updateUser(id: string, attributes?: Params | undefined) {
        if (__DEV__) { logger.debug('updateUser', id, attributes); }
    }

    trackPageView(screen: string, attributes?: Params, _metrics?: Metrics): void {
        if (__DEV__) { logger.debug('Show Screen', screen, attributes); }
    }

    trackEvent(event: string, _attributes?: Params, _metrics?: Metrics): void {
        if (__DEV__) { logger.debug('Track Event', event); }
    }

    trackAction(screen: string, action: string, attributes?: Params, _metrics?: Metrics): void {
        if (__DEV__) { logger.debug('Track Action', screen, action, attributes); }
    }
}

