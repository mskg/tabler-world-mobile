import Auth from '@aws-amplify/auth';
import { Updates } from 'expo';
import React from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import uuid4 from 'uuid4';
import { ActionNames } from '../analytics/ActionNames';
import { AuditedScreen } from '../analytics/AuditedScreen';
import { AuditScreenName } from '../analytics/AuditScreenName';
import { startDemo as enableDemoMode } from '../helper/demoMode';
import { Categories, Logger } from '../helper/Logger';
import { OpenLink } from '../helper/OpenLink';
import { getParameterValue } from '../helper/parameters/getParameterValue';
import { UrlParameters } from '../helper/parameters/Urls';
import { I18N } from '../i18n/translation';
import { ParameterName } from '../model/graphql/globalTypes';
import { IAppState } from '../model/IAppState';
import { confirmSignIn } from '../redux/actions/user';
import { Background, Greeting, Logo } from './Background';
import Input from './Input';
import { styles } from './Styles';

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

class SignInBase extends AuditedScreen<Props, State> {
    constructor(props: Props) {
        super(props, AuditScreenName.SignIn);

        this.state = {
            username: props.username,
            working: false,
            error: null,
        };
    }

    async getRandomString(_bytes: number) {
        // TOOD: will move to cryto in expo v33
        return uuid4();
    }

    async signIn(doThrow = false) {
        const { username } = this.state;
        logger.debug('Try sign In for ' + username);

        try {
            this.audit.trackAction(ActionNames.SignIn);
            const user = await Auth.signIn(username as string);
            logger.debug('signIn response', user);

            this.props.confirmSignIn({
                username: username as string,
                state: user,
            });
        } catch (err) {
            this.audit.trackAction(ActionNames.SignInFailed);
            if (doThrow) throw err;

            logger.error(err, 'Error signIn');
            this.setState({ error: err.message || err, working: false });
        }
    }

    _demo = async () => {
        Alert.alert(
            I18N.SignIn.demo.title,
            I18N.SignIn.demo.text,
            [
                {
                    text: I18N.SignIn.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.SignIn.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        await enableDemoMode();
                        Updates.reloadFromCache();
                    },
                },
            ],
        );
    }

    _signInOrUp = async () => {
        logger.debug('signInOrUp');
        const { username } = this.state;

        try {
            this.setState({ working: true, error: null });
            await this.signIn(true);
        } catch (err) {
            // which is ok here
            if (err.code === 'UserNotFoundException') {
                this.audit.trackAction(ActionNames.SignUp);

                const newUser = {
                    username: username as string,
                    password: await this.getRandomString(30),
                };

                try {
                    await Auth.signUp(newUser);
                    await this.signIn();
                } catch (signUpError) {
                    this.audit.trackAction(ActionNames.SignUpFailed);

                    logger.error(signUpError, 'Error signUp');
                    this.setState({ error: signUpError.message || signUpError, working: false });
                }
            } else {
                logger.error(err, 'Error signInOrUp');
                this.setState({ error: err.message || err, working: false });
            }
        }
    }

    _lauchJoin = async () => {
        const urls = await getParameterValue<UrlParameters>(ParameterName.urls);
        OpenLink.url(urls.join);
    }

    render() {
        return (
            <Background>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.container}>
                        <KeyboardAvoidingView behavior="padding" >
                            <Logo />
                            <Greeting title={I18N.SignIn.welcomeBack} subtitle={I18N.SignIn.signin} />


                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder={I18N.SignIn.placeholderEMail}
                                    value={this.state.username}
                                    onChangeText={text => this.setState({ username: (text || '').toLowerCase() })}
                                    placeholderTextColor={this.props.theme.colors.placeholder}
                                    style={{ borderBottomColor: this.props.theme.colors.accent, color: this.props.theme.colors.text }} />
                            </View>

                            <View style={[styles.buttonContainer]}>
                                <Button
                                    color={this.props.theme.colors.accent}
                                    style={{ ...styles.button }} mode="contained"
                                    onPress={this._signInOrUp}
                                    loading={this.state.working}
                                    disabled={!this.state.username || this.state.working}>{I18N.SignIn.continue}</Button>
                            </View>

                            {this.state.error && (
                                <View style={[styles.errorMessage]}>
                                    <Text>{this.state.error}</Text>
                                </View>
                            )}

                            <View style={styles.demo}>
                                <TouchableWithoutFeedback onPress={this._demo}>
                                    <Text style={[styles.demoText, { color: this.props.theme.colors.accent }]}>{I18N.SignIn.demoMode}</Text>
                                </TouchableWithoutFeedback>

                                <TouchableWithoutFeedback onPress={this._lauchJoin}>
                                    <Text style={[styles.demoText, { color: this.props.theme.colors.accent }]}>{I18N.SignIn.join}</Text>
                                </TouchableWithoutFeedback>
                            </View>
                        </KeyboardAvoidingView>
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
    confirmSignIn,
},
)(withTheme(SignInBase));
