import Auth from '@aws-amplify/auth';
import React, { PureComponent } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import uuid4 from "uuid4";
import { Audit } from '../analytics/Audit';
import { IAuditor } from '../analytics/Types';
import { Categories, Logger } from '../helper/Logger';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { confirmSignIn } from '../redux/actions/user';
import { Background, Greeting, Logo } from './Background';
import Input from "./Input";
import { styles } from "./Styles";

type Props = {
    theme: Theme,
    username: string | undefined,
    confirmSignIn: typeof confirmSignIn,
};

type State = {
    username: string | undefined,
    working: boolean,
    error: string | null,
};

const logger = new Logger(Categories.Screens.SignIn);

class SignInBase extends PureComponent<Props, State> {
    audit: IAuditor;

    constructor(props: Props) {
        super(props);
        this.audit = Audit.screen("SignIn");

        this.state = {
            username: props.username,
            working: false,
            error: null,
        }
    }

    componentDidMount() {
        this.audit.submit();
    }

    async getRandomString(bytes: number) {
        //TOOD: will move to cryto in expo v33
        return uuid4();
    }

    async signIn(doThrow = false) {
        const { username } = this.state;
        logger.debug('Try sign In for ' + username);

        try {
            this.audit.trackAction("signIn");
            const user = await Auth.signIn(username as string);
            logger.debug("signIn response", user);

            this.props.confirmSignIn({
                username: username as string,
                state: user
            });
        }
        catch (err) {
            this.audit.trackAction("signIn failed");
            if (doThrow) throw err;

            logger.error(err, "Error signIn");
            this.setState({ error: err.message || err, working: false, });
        }
    }

    _signInOrUp = async () => {
        logger.debug("signInOrUp");
        const { username } = this.state;

        try {
            this.setState({ working: true, error: null, });
            await this.signIn(true);
        }
        catch (err) {
            // which is ok here
            if (err.code === "UserNotFoundException") {
                this.audit.trackAction("SignUp");

                const newUser = {
                    username: username as string,
                    password: await this.getRandomString(30),
                };

                // contains sensitive data!
                // logger.log("creating", newUser);

                try {
                    await Auth.signUp(newUser);
                    await this.signIn();

                    this.audit.trackAction("SignUp");
                }
                catch (signUpError) {
                    this.audit.trackAction("SignUp failed");

                    logger.error(signUpError, "Error signUp");
                    this.setState({ error: signUpError.message || signUpError, working: false, });
                }
            } else {
                logger.error(err, "Error signInOrUp");
                this.setState({ error: err.message || err, working: false, });
            }
        }
    }

    render() {
        return (
            <Background>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.container}>
                        <Logo />
                        <Greeting title={I18N.SignIn.welcomeBack} subtitle={I18N.SignIn.signin} />

                        <View style={styles.inputContainer}>
                            <Input
                                placeholder={I18N.SignIn.placeholderEMail}
                                value={this.state.username}
                                onChangeText={text => this.setState({ username: text })}
                                placeholderTextColor={this.props.theme.colors.placeholder}
                                style={{ borderBottomColor: this.props.theme.colors.accent }} />
                        </View>

                        <View style={[styles.buttonContainer]}>
                            <Button
                                color={this.props.theme.colors.accent}
                                style={{ ...styles.button }} mode="contained"
                                onPress={this._signInOrUp}
                                loading={this.state.working}
                                disabled={!this.state.username || this.state.working}>{I18N.SignIn.continue}</Button>
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
        username: state.auth.username,
    }), {
        confirmSignIn
    }
)(withTheme(SignInBase));