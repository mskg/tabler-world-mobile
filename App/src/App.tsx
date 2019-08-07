import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { ScreenOrientation } from 'expo';
import { useKeepAwake } from 'expo-keep-awake';
import React from 'react';
import { bootstrapAnalytics } from './analytics/bootstrapAnalytics';
import { withApollo } from './apollo/withApollo';
import { bootstrapAuthentication } from "./auth/bootstrapAuthentication";
import { withAuthenticator } from './auth/withAuthenticator';
import { fix2940 } from './components/fix2940';
import { StandardStatusBar } from './components/Header';
import Linking from './components/Linking';
import { PushNotifications } from './components/PushNotifications';
import Reloader from './components/Reloader';
import { withSkakeErrorReport } from './components/ShakeErrorReport';
import { Snacks } from './components/Snacks';
import { withPreCached } from './components/withPreCached';
import { disableFontScaling } from "./helper/disableFontScaling";
import { Categories, Logger } from './helper/Logger';
import { bootStrapSentry } from './helper/Sentry';
import { Features, isFeatureEnabled } from './model/Features';
import { Navigation } from './navigation/redux';
import { bootstrapRedux } from './redux/bootstrapRedux';
import { withStore } from './redux/withStore';
import { registerFetchTask } from './tasks/Fetch';
import { registerForPushNotificationsAsync } from './tasks/Push';
import { withPaperProvider } from './theme/withPaperProvider';

const logger = new Logger(Categories.App);
logger.log("Bootstrap");

logger.log("Bootstrapping Sentry");
bootStrapSentry();

logger.log("Bootstrapping UI settings");
disableFontScaling();
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

logger.log("Bootstrapping Authentication");
bootstrapAuthentication();

logger.log("Bootstrapping Analytics");
bootstrapAnalytics();

logger.log("Bootstrapping redux");
bootstrapRedux();

if (isFeatureEnabled(Features.BackgroundFetch)) {
  logger.log("Bootstrapping background-fetch");
  registerFetchTask();
}

logger.log("Bootstrapping push notifications");
registerForPushNotificationsAsync();

fix2940();

const App = () => {
  if (__DEV__) useKeepAwake();

  return (
    <React.Fragment>
      <StandardStatusBar />
      <Reloader />
      <ActionSheetProvider>
        <Navigation />
      </ActionSheetProvider>
      <Snacks />
      <PushNotifications />
      <Linking />
    </React.Fragment>
  )
};

logger.log("Loading...");
export default withPreCached(
  withApollo(
    withStore(
      withPaperProvider(
        withSkakeErrorReport(
          withAuthenticator(App)
        )
      )
    )
  )
);
