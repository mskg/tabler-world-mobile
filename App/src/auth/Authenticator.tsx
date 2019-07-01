import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import gql from 'graphql-tag';
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import ExpoSentry from "sentry-expo";
import { Audit } from '../analytics/Audit';
import { AuditPropertyNames } from '../analytics/AuditPropertyNames';
import { cachedAolloClient } from '../apollo/bootstrapApollo';
import Reloader from '../components/Reloader';
import { Categories, Logger } from "../helper/Logger";
import { IAppState } from "../model/IAppState";
import { MeFragment } from "../queries/MeFragment";
import { INITIAL_STATE } from "../redux/initialState";
import ConfirmSignIn from "./ConfirmSignIn";
import SignIn from "./SignIn";

type Props = {
  authState: typeof INITIAL_STATE.auth.state;
  app: React.ReactElement;
  // user?: IWhoAmI;
  optOutAnalytics: boolean,
};

type State = {};

const logger = new Logger(Categories.UIComponents.Authenticator);
class AuthenticatorBase extends PureComponent<Props, State> {
  componentDidMount() {
    if (this.props.authState === "singedIn") {
      this.configureContext(this.props);
    }
  }

  configureContext(nextProps) {
    logger.debug("setting usercontext");

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
      client.query({
        query: gql`
          query Me {
            Me {
              ...MeFragment
            }
          }

          ${MeFragment}
        `,
        fetchPolicy: "cache-first",
      }).then(result => {
        if (result.errors) {
          result.errors.forEach(e => logger.error(e, "Could not load me"));
          throw new Error("Could not load me");
        }

        logger.log("Updating user profile");
        Audit.updateUser(
          result.data.Me.id,
          {
            ...appProps,
            [AuditPropertyNames.Association]: result.data.Me.association.name,
            [AuditPropertyNames.Area]: result.data.Me.area.name,
            [AuditPropertyNames.Club]: result.data.Me.club.name,
          }
        );

        ExpoSentry.setUserContext({
          id: result.data.Me.id,
        });
      }).catch(e => {
        Audit.updateUser(undefined, appProps);
        logger.error(e, "Could not load me");
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.authState === "singedIn") {
      this.configureContext(nextProps);
    }
  }

  render() {
    if (this.props.authState === "confirm") {
      return (
        <>
          <Reloader />
          <ConfirmSignIn />
        </>
      );
    }
    else if (this.props.authState === "signin") {
      return (
        <>
          <Reloader />
          <SignIn />
        </>);
    }
    else {
      return this.props.app;
    }
  }
}

export const Authenticator = connect((state: IAppState) => ({
  authState: state.auth.state,
  optOutAnalytics: state.settings.optOutAnalytics,
}))(AuthenticatorBase);
