import Analytics from '@aws-amplify/analytics';
import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import React, { PureComponent } from "react";
import { Platform } from 'react-native';
import { connect } from "react-redux";
import Reloader from '../components/Reloader';
import { Categories, Logger } from "../helper/Logger";
import { IAppState } from "../model/IAppState";
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

    // ExpoSentry.setUserContext({
    //   id: nextProps.user.id.toString(),
    //   username: nextProps.user.email
    // });

    if (nextProps.optOutAnalytics) {
      Analytics.disable();
    } else {
      Analytics.enable();

      Analytics.updateEndpoint({
        address: Constants.installationId,
        // userId: nextProps.user.id.toString(),

        attributes: {
          channel: Constants.manifest.releaseChannel,
        },

        demographic: {
          appVersion: Constants.manifest.revisionId,
          locale: Localization.locale.toLocaleLowerCase(),

          platform: Platform.OS,
          platformVersion: Platform.Version,

          modelVersion: Constants.deviceYearClass.toString(),
        },

        // userAttributes: {
        //   club: nextProps.user.club.club,
        //   association: nextProps.user.association.association,
        //   area: nextProps.user.area.area,
        // },
      });
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
