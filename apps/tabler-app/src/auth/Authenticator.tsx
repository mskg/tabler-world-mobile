import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import React, { PureComponent } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { connect } from 'react-redux';
import * as ExpoSentry from 'sentry-expo';
import { Audit } from '../analytics/Audit';
import { AuditPropertyNames } from '../analytics/AuditPropertyNames';
import { cachedAolloClient } from '../apollo/bootstrapApollo';
import Loading from '../components/Loading';
import Reloader from '../components/Reloader';
import { isDemoModeEnabled } from '../helper/demoMode';
import { Categories, Logger } from '../helper/Logger';
import { Me } from '../model/graphql/Me';
import { IAppState } from '../model/IAppState';
import { GetMeQuery } from '../queries/Member/GetMeQuery';
import { INITIAL_STATE } from '../redux/initialState';
import { light as lightTheme } from '../theme/light';
import ConfirmSignIn from './ConfirmSignIn';
import SignIn from './SignIn';

type Props = {
    authState: typeof INITIAL_STATE.auth.state;
    app: React.ReactElement;
    // user?: IWhoAmI;
    optOutAnalytics: boolean,
};

type State = {
    demoMode?: boolean,
};

const logger = new Logger(Categories.UIComponents.Authenticator);
class AuthenticatorBase extends PureComponent<Props, State> {

    state: State = {};

    async componentDidMount() {
        if (this.props.authState === 'singedIn') {
            this.configureContext(this.props);
        }

        const demoMode = await isDemoModeEnabled();

        if (demoMode) {
            Audit.disable();
        } else {
            Audit.enable();
        }

        this.setState({ demoMode });
    }

    configureContext(nextProps) {
        logger.debug('setting usercontext');

        if (nextProps.optOutAnalytics) {
            Audit.disable();
        } else {
            Audit.enable();

            // only place where those are used
            const appProps = {
                [AuditPropertyNames.Channel]: Constants.manifest.releaseChannel,
                [AuditPropertyNames.Version]: Constants.manifest.version || 'dev',
                [AuditPropertyNames.Locale]: Localization.locale.toLocaleLowerCase(),
            };

            const client = cachedAolloClient();
            client.query<Me>({
                query: GetMeQuery,
                fetchPolicy: 'cache-first',
            }).then((result) => {
                if (result.errors) {
                    result.errors.forEach(e => logger.error(e, 'Could not load me'));
                    throw new Error('Could not load me');
                }

                logger.log('Updating user profile');
                Audit.updateUser(
                    result.data.Me.id.toString(),
                    {
                        ...appProps,
                        [AuditPropertyNames.Association]: result.data.Me.association.name,
                        [AuditPropertyNames.Area]: result.data.Me.area.name,
                        [AuditPropertyNames.Club]: result.data.Me.club.name,
                    },
                );

                ExpoSentry.configureScope((scope) => scope.setUser({
                    id: result.data.Me.id.toString(),
                }));

            }).catch((e) => {
                Audit.updateUser(undefined, appProps);
                logger.error(e, 'Could not load me');
            });
        }
    }

    componentDidUpdate() {
        if (this.props.authState === 'singedIn') {
            this.configureContext(this.props);
        }
    }

    render() {
        if (this.state.demoMode == null) return null;

        if (!this.state.demoMode && this.props.authState === 'confirm') {
            return (
                <PaperProvider theme={lightTheme}>
                    <Reloader />
                    <ConfirmSignIn />
                    <Loading />
                </PaperProvider>
            );
        } if (!this.state.demoMode && this.props.authState === 'signin') {
            return (
                <PaperProvider theme={lightTheme}>
                    <Reloader />
                    <SignIn />
                    <Loading />
                </PaperProvider>
            );
        }

        return this.props.app;
    }
}

export const Authenticator = connect((state: IAppState) => ({
    authState: state.auth.state,
    optOutAnalytics: state.settings.optOutAnalytics,
}))(AuthenticatorBase);
