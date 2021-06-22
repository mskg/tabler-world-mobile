import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import React, { PureComponent } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { connect } from 'react-redux';
import * as ExpoSentry from 'sentry-expo';
import { Audit } from '../analytics/Audit';
import { AuditPropertyNames } from '../analytics/AuditPropertyNames';
import { cachedAolloClient } from '../apollo/bootstrapApollo';
import Reloader from '../components/Reloader';
import { createApolloContext } from '../helper/createApolloContext';
import { isDemoModeEnabled } from '../helper/demoMode';
import { Categories, Logger } from '../helper/Logger';
import { Me } from '../model/graphql/Me';
import { IAppState } from '../model/IAppState';
import { GetMeQuery } from '../queries/Member/GetMeQuery';
import { INITIAL_STATE } from '../redux/initialState';
import { Families } from '../theme/getFamilyColor';
import { light } from '../theme/light';
import { updateThemeFromFamily } from '../theme/theming';
import ConfirmSignIn from './ConfirmSignIn';
import SignIn from './SignIn';

type Props = {
    authState: typeof INITIAL_STATE.auth.state;
    app: React.ReactElement;
    // user?: IWhoAmI;
    optOutAnalytics: boolean,
    accentColor: Families,
};

type State = {
    demoMode?: boolean,
    theme: any,
};

const logger = new Logger(Categories.UIComponents.Authenticator);
class AuthenticatorBase extends PureComponent<Props, State> {
    state: State = {
        theme: light,
    };

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
                context: createApolloContext('authenticate-me'),
            })
                .then((result) => {
                    logger.log('Updating user profile');

                    Audit.updateUser(
                        result.data.Me.id.toString(),
                        {
                            ...appProps,
                            [AuditPropertyNames.Association]: result.data.Me.association.id,
                            [AuditPropertyNames.Area]: result.data.Me.area.id,
                            [AuditPropertyNames.Club]: result.data.Me.club.id,
                        },
                    );

                    ExpoSentry.configureScope((scope) => scope.setUser({
                        id: result.data.Me.id.toString(),
                    }));
                })
                .catch((e) => {
                    Audit.updateUser(undefined, appProps);
                    logger.log('authenticate-me', e);
                });
        }
    }

    componentDidUpdate() {
        if (this.props.authState === 'singedIn') {
            this.configureContext(this.props);
        }
    }

    static getDerivedStateFromProps(props: Props, _state: State) {
        return {
            theme: updateThemeFromFamily(light, props.accentColor),
        };
    }

    render() {
        if (this.state.demoMode == null) return null;

        if (!this.state.demoMode && this.props.authState === 'confirm') {
            return (
                <PaperProvider theme={this.state.theme}>
                    <Reloader />
                    <ConfirmSignIn />
                </PaperProvider>
            );
        } if (!this.state.demoMode && this.props.authState === 'signin') {
            return (
                <PaperProvider theme={this.state.theme}>
                    <Reloader />
                    <SignIn />
                </PaperProvider>
            );
        }

        return this.props.app;
    }
}

export const Authenticator = connect((state: IAppState) => ({
    authState: state.auth.state,
    optOutAnalytics: state.settings.optOutAnalytics,
    accentColor: state.auth.accentColor,
}))(AuthenticatorBase);
