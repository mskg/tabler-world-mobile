import Auth from '@aws-amplify/auth';
import { Linking } from 'expo';
import gql from 'graphql-tag';
import React, { PureComponent } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { Audit } from '../analytics/Audit';
import { IAuditor } from '../analytics/Types';
import { bootstrapApollo } from '../apollo/bootstrapApollo';
import { Categories, Logger } from '../helper/Logger';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { restoreFavorites } from '../redux/actions/settings';
import { replaceUser, signin, singedIn } from '../redux/actions/user';
import { Background, Greeting, Logo } from './Background';
import Input from './Input';
import { styles } from "./Styles";

type Props = {
    theme: Theme,
    authState: any,
    updateUser: typeof replaceUser;
    singedIn: typeof singedIn;
    signin: typeof signin,
    restoreFavorites: typeof restoreFavorites,
};

type State = {
    code: string,
    working: boolean,
    noretry: boolean;
    tries: number;
    error: string | null;
};

const logger = new Logger(Categories.Screens.ConfirmSignIn);

class ConfirmBase extends PureComponent<Props, State> {
    audit: IAuditor;

    constructor(props) {
        super(props);

        this.state = {
            code: '',
            working: false,
            noretry: false,
            tries: 3,
            error: null,
        }

        this.audit = Audit.screen("Confirm SignIn");
    }

    _handleOpenURL = (event) => {
        let { path, queryParams } = Linking.parse(event.url);
        logger.debug(path, queryParams);

        if (path == "confirm") {
            this.audit.trackAction("E-Mail Link");

            this.setState({code: queryParams["code"] as string});
            this._confirm();
        }
    }

    componentDidMount() {
        this.audit.submit();

        // we're reloaded without a valid state
        if (this.props.authState == null) {
            this.props.signin();
        }

        Linking.addEventListener('url', this._handleOpenURL);
    }

    componentWillUnmount() {
        Linking.removeEventListener('url', this._handleOpenURL);
    }

    componentWillReceiveProps() {
        this.setState({ code: '', working: false, noretry: false, tries: 3, error: null });
    }

    _confirm = async () => {
        try {
            logger.debug("confirming signing");
            this.setState({ working: true, error: null, });

            const { code } = this.state;
            const user = this.props.authState;

            logger.debug("sendCustomChallengeAnswer");
            await Auth.sendCustomChallengeAnswer(user, code);

            logger.debug("checking currentSession");
            await Auth.currentSession();

            try {
                this.audit.trackAction("Confirm");

                const client = await bootstrapApollo();
                const whoAmI = await client.query({
                    query: gql`query WhoAmILogin {
    Me {
        id
        lastname
        firstname
        pic
        rtemail

        area {
            id
            area
        }

        association {
            association
        }

        club {
            id
            club
        }
    }
}`,
                    fetchPolicy: "network-only",
                    errorPolicy: "none",
                });

                if (whoAmI == null) throw new Error("user is null");

                logger.log(whoAmI.data.Me);

                delete whoAmI.data.Me["__typename"];
                this.props.updateUser(whoAmI.data.Me);

                // this.props.restoreFavorites();
                this.props.singedIn();
            }
            catch (e) {
                logger.error(e, "failed to login");
                this.audit.trackAction("Confirm failed");

                this.setState({
                    error: I18N.SignIn.accessDenied,
                    noretry: true,
                    working: false
                });
            }
        }
        catch (err) {
            logger.log(err);

            if (err.code === "NotAuthorizedException") {
                this.setState({
                    error: I18N.SignIn.codeWrong,
                    noretry: true,
                    working: false
                });
            } else {
                this.setState({
                    tries: this.state.tries - 1,
                    working: false,
                    error: I18N.SignIn.codeVerify(this.state.tries)
                });
            }
        }
    }

    render() {
        return (
            <Background>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.container}>
                        <Logo />
                        <Greeting title={I18N.SignIn.confirmTitle} subtitle={I18N.SignIn.checkEmail} />

                        <View style={styles.inputContainer}>
                            <Input
                                placeholder={I18N.SignIn.placeholderCode}
                                value={this.state.code}
                                keyboardType='numeric'
                                onChangeText={text => this.setState({ code: text })}
                                placeholderTextColor={this.props.theme.colors.placeholder}
                                style={{ borderBottomColor: this.props.theme.colors.accent }} />
                        </View>


                        <View style={[styles.buttonContainer]}>
                            <Button
                                color={this.props.theme.colors.accent}
                                style={styles.button} mode="contained"
                                disabled={!this.state.code || this.state.working || this.state.noretry}
                                loading={this.state.working}
                                onPress={this._confirm}
                            >{I18N.SignIn.confirm}</Button>

                            <Button
                                color={this.props.theme.colors.accent}
                                style={styles.button} mode="contained"
                                onPress={() => this.props.signin()}>{I18N.SignIn.cancel}</Button>
                        </View>

                        {this.state.error &&
                            <View style={[styles.errorMessage]}>
                                <Text>{this.state.error}</Text>
                            </View>
                        }
                    </View>
                </TouchableWithoutFeedback>
            </Background>
        );
    }
}

export default connect(
    (state: IAppState) => ({
        authState: state.auth.signinState,
    }),
    {
        updateUser: replaceUser,
        restoreFavorites,
        singedIn,
        signin
    }
)(withTheme(ConfirmBase));
