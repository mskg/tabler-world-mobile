import { Metrics, Params } from './Types';

export interface IAnalyticsProvider {
    enable(): void;
    disable(): void;

    updateUser(id?: string, attributes?: Params);
    trackPageView(screen: string, attributes?: Params, metrics?: Metrics): void;
    trackEvent(event: string, attributes?: Params, metrics?: Metrics): void;
    trackAction(screen: string, action: string, attributes?: Params, metrics?: Metrics);
}
