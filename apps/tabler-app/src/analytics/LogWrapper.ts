import { IAnalyticsProvider } from './IAuditor';
import { logger } from './logger';
import { Metrics, Params } from './Types';

export class LogWrapper implements IAnalyticsProvider {
    constructor(private inner: IAnalyticsProvider) {
    }

    enable(): void {
        if (__DEV__) {
            logger.debug('enable');
        }

        this.inner.enable();
    }

    disable(): void {
        if (__DEV__) {
            logger.debug('disable');
        }

        this.inner.disable();
    }

    updateUser(id: string, attributes?: Params | undefined) {
        if (__DEV__) {
            logger.debug('updateUser', id, attributes);
        }

        this.inner.updateUser(id, attributes);
    }

    trackPageView(screen: string, attributes?: Params, metrics?: Metrics): void {
        if (__DEV__) {
            logger.debug('Show Screen', screen, attributes);
        }

        this.inner.trackPageView(screen, attributes, metrics);
    }

    trackEvent(event: string, attributes?: Params, metrics?: Metrics): void {
        if (__DEV__) {
            logger.debug('Track Event', event);
        }

        this.inner.trackEvent(event, attributes, metrics);
    }

    trackAction(screen: string, action: string, attributes?: Params, metrics?: Metrics): void {
        if (__DEV__) {
            logger.debug('Track Action', screen, action, attributes);
        }

        this.inner.trackAction(screen, action, attributes, metrics);
    }
}
