
import Constants from 'expo-constants';
import { Categories, Logger } from '../helper/Logger';
import { AmplitudeAnalytics } from './AmplitudeAnalytics';
import { Audit } from './Audit';
import { CognitoAnalytics } from './CognitoAnalytics';
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
    provider = new CognitoAnalytics(
      region, cognitoAnalytics
    );
  }

  if (amplitudeAnalytics != null && amplitudeAnalytics != "") {
    provider = new AmplitudeAnalytics(
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