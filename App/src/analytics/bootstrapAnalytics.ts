
import Analytics from '@aws-amplify/analytics';
import Constants from 'expo-constants';
import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.Audit);

export function bootstrapAnalytics() {
  const extra = Constants.manifest.extra || {};
  const { region, analytics } = extra;

  logger.log("region", region, "analytics", analytics);

  Analytics.configure({
    disabled: analytics == null || analytics === "" || __DEV__,
    autoSessionRecord: true,
    AWSPinpoint: {
      appId: analytics,
      region,
    }
  });
}