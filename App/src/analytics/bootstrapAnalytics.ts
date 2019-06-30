
import Constants from 'expo-constants';
import { Categories, Logger } from '../helper/Logger';
import { Audit } from './Audit';
import { IAnalyticsProvider } from './IAuditor';
import { LogWrapper } from './LogWrapper';

const logger = new Logger(Categories.Audit);

export function bootstrapAnalytics() {
  const extra = Constants.manifest.extra || {};
  const { region, cognitoAnalytics, amplitudeAnalytics  } = extra;

  logger.log(
    "region", region,
    "cognito", cognitoAnalytics,
    "amplitude", amplitudeAnalytics);

  let provider: IAnalyticsProvider | undefined;

  if (cognitoAnalytics != null && cognitoAnalytics != "") {
    const analytics = require ('./CognitoAnalytics');

    provider = new analytics.CognitoAnalytics(
      region, cognitoAnalytics
    );
  }

  if (amplitudeAnalytics != null && amplitudeAnalytics != "") {
    const analytics = require ('./AmplitudeAnalytics');

    provider = new analytics.AmplitudeAnalytics(
      amplitudeAnalytics
    );
  }

  // allow inspection
  if (__DEV__ && provider != null) {
    provider = new LogWrapper(provider);
  }

  if (provider != null) {
    Audit.init(provider);
  }
}