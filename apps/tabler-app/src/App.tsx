import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { ScreenOrientation } from 'expo';
import React from 'react';
import { useDispatch } from 'react-redux';
import { bootstrapAnalytics } from './analytics/bootstrapAnalytics';
import { withApollo } from './apollo/withApollo';
import { bootstrapAuthentication } from './auth/bootstrapAuthentication';
import { withAuthenticator } from './auth/withAuthenticator';
import { withWhoopsErrorBoundary } from './components/ErrorBoundary';
import { fix2940 } from './components/fix2940';
import { StandardStatusBar } from './components/Header';
import Linking from './components/Linking';
import { PushNotifications } from './components/PushNotifications';
import Reloader from './components/Reloader';
import { withSkakeErrorReport } from './components/ShakeErrorReport';
import { Snacks } from './components/Snacks';
import { withLoadingAnimation } from './components/withLoadingAnimation';
import { withPreCached } from './components/withPreCached';
import { bootStrapSentry } from './helper/bootStrapSentry';
import { disableFontScaling } from './helper/disableFontScaling';
import { Categories, Logger } from './helper/Logger';
import { Features, isFeatureEnabled } from './model/Features';
import { Navigation } from './navigation/redux';
import { checkNetwork } from './redux/actions/state';
import { bootstrapRedux } from './redux/bootstrapRedux';
import { withStore } from './redux/withStore';
import { SubscribeToConversationUpdates } from './screens/Conversations/SubscribeToConversationUpdates';
import { registerFetchTask } from './tasks/registerFetchTask';
import { registerLocationTask } from './tasks/registerLocationTask';
import { withAppearanceProvider } from './theme/withAppearanceProvider';
import { withPaperProvider } from './theme/withPaperProvider';

const logger = new Logger(Categories.App);
logger.log('Bootstrap');

logger.log('Bootstrapping Sentry');
bootStrapSentry();

logger.log('Bootstrapping UI settings');
disableFontScaling();
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

logger.log('Bootstrapping Authentication');
bootstrapAuthentication();

logger.log('Bootstrapping Analytics');
bootstrapAnalytics();

logger.log('Bootstrapping redux');
bootstrapRedux();

if (isFeatureEnabled(Features.BackgroundFetch)) {
    logger.log('Bootstrapping background-fetch');
    registerFetchTask();
}

logger.log('Bootstrapping background-location');
registerLocationTask();

fix2940();
// useScreens();

const App = () => {
    // if (__DEV__) useKeepAwake();

    const dispatch = useDispatch();
    dispatch(checkNetwork());

    return (
        <>
            <StandardStatusBar />
            <Reloader />
            <ActionSheetProvider>
                <Navigation />
            </ActionSheetProvider>
            <Snacks />
            <PushNotifications />
            <SubscribeToConversationUpdates />
            <Linking />
        </>
    );
};

logger.log('Loading...');
// tslint:disable-next-line: export-name
export default withAppearanceProvider(
    withPreCached(
        withApollo(
            withStore(
                withPaperProvider(
                    withSkakeErrorReport(
                        withLoadingAnimation(
                            withAuthenticator(
                                withWhoopsErrorBoundary(
                                    App,
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ),
);
