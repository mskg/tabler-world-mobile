import Auth from '@aws-amplify/auth';
import { Ionicons } from '@expo/vector-icons';
import { UrlParameters } from '@mskg/tabler-world-config-app';
import * as Updates from 'expo-updates';
import _ from 'lodash';
import React from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Text, Theme, withTheme } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { connect } from 'react-redux';
import uuid4 from 'uuid4';
import { ActionNames } from '../analytics/ActionNames';
import { AuditedScreen } from '../analytics/AuditedScreen';
import { AuditScreenName } from '../analytics/AuditScreenName';
import { startDemo as enableDemoMode } from '../helper/demoMode';
import { Categories, Logger } from '../helper/Logger';
import { OpenLink } from '../helper/OpenLink';
import { getParameterValue } from '../helper/parameters/getParameterValue';
import { I18N } from '../i18n/translation';
import { ParameterName } from '../model/graphql/globalTypes';
import { IAppState } from '../model/IAppState';
import { confirmSignIn } from '../redux/actions/user';
import { Background, EMail, Greeting, Logo } from './Background';
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
    family: string,
};

const logger = new Logger(Categories.Screens.SignIn);

let loginParts: string[];
try {
    // @ts-ignore
    loginParts = _(I18N.Screen_SignIn.placeholderEMail || '') // firstname.lastname@129-de.roundtable.world
        .split('@')
        .thru((p) => [
            _(p[0]).split('.') // firstname.lastname
                .thru(
                    (f) => [
                        f[0],
                        '.',
                        f[1],
                    ],
                )
                .value(),
            '@',
            _(p[1]).split('.') // 129-de.roundtable.world
                .thru(
                    (a) => [
                        _(a[0]).split('-') // 129-de
                            .thru((d) => [
                                d[0],
                                '-',
                                d[1],
                            ])
                            .value(),
                        '.',
                        a[1],
                        '.',
                        a[2],
                    ],
                )
                .value(),
        ])
        .flattenDepth(2)
        .value();
} catch {
    loginParts = [I18N.Screen_SignIn.placeholderEMail];
}


class SignInBase extends AuditedScreen<Props, State> {
    constructor(props: Props) {
        super(props, AuditScreenName.SignIn);

        this.state = {
            username: props.username,
            working: false,
            error: null,
            family: 'ROUNDTABLE',
        };
    }

    async getRandomString(_bytes: number) {
        // TOOD: will move to cryto in expo v33
        return uuid4();
    }

    async signIn(doThrow = false) {
        const { username } = this.state;
        logger.debug('Try sign In for', username);

        try {
            this.audit.trackAction(ActionNames.SignIn);
            const user = await Auth.signIn(
                username as string,
            );

            logger.debug('signIn response', user);

            this.props.confirmSignIn({
                username: username as string,
                state: user,
            });
        } catch (err) {
            this.audit.trackAction(ActionNames.SignInFailed);
            if (doThrow) throw err;

            logger.error('signin', err);
            this.setState({ error: err.message || err, working: false });
        }
    }

    _demo = async () => {
        Alert.alert(
            I18N.Screen_SignIn.demo.title,
            I18N.Screen_SignIn.demo.text,
            [
                {
                    text: I18N.Screen_SignIn.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.Screen_SignIn.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        await enableDemoMode();
                        Updates.reloadAsync();
                    },
                },
            ],
        );
    }

    matchingPart = () => {
        if (!this.state.username) { return -1; }

        if (this.state.username.match(/[a-z]+\.[a-z]+@\d{1,4}-[a-z]{2}\.(roundtable|ladiescircle|41er)\.world/)) {
            return 11;
        }

        if (this.state.username.match(/[a-z]+\.[a-z]+@\d{1,4}-[a-z]{2}\.(roundtable|ladiescircle|41er)\./)) {
            return 9;
        }

        if (this.state.username.match(/[a-z]+\.[a-z]+@\d{1,4}-[a-z]{2}\./)) {
            return 6;
        }

        if (this.state.username.match(/[a-z]+\.[a-z]+@\d{1,4}-/)) {
            return 5;
        }

        if (this.state.username.match(/[a-z]+\.[a-z]+@/)) {
            return 3;
        }

        if (this.state.username.match(/[a-z]+\./)) {
            return 2;
        }

        return 0;
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

                    logger.error('signup', new Error(signUpError.code), signUpError);
                    this.setState({ error: signUpError.message || signUpError, working: false });
                }
            } else {
                logger.error('signinorup', new Error(err.code), err);
                this.setState({ error: err.message || err, working: false });
            }
        }
    }

    _lauchJoin = async () => {
        const urls = await getParameterValue<UrlParameters>(ParameterName.urls);
        OpenLink.url(urls.join);
    }

    _changeText = (text) => {
        this.setState({ username: (text || '').trim().toLowerCase() });
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        const matchingPart = this.matchingPart();
        const matches = matchingPart >= 11;

        return (
            <Background color={'white'}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.container}>
                        <KeyboardAvoidingView behavior="padding">
                            <Logo />

                            <Greeting
                                title={I18N.Screen_SignIn.welcomeBack}
                                subtitle={I18N.Screen_SignIn.signin}
                            />

                            <View style={{ ...styles.inputContainer, paddingRight: 24 }}>
                                <RNPickerSelect
                                    placeholder={{}}
                                    value={this.state.family}

                                    items={[
                                        { 'label': 'Ladies Circle International', value: 'LADIESCIRCLE' },
                                        { 'label': 'Round Table International', value: 'ROUNDTABLE' },
                                        { 'label': '41 International', value: '41ER' },
                                    ]}

                                    Icon={() => {
                                        return <Ionicons name="md-chevron-down" size={20} />;
                                    }}

                                    onValueChange={(family) => this.setState({ family })}
                                    useNativeAndroidPickerStyle={false}

                                    textInputProps={{
                                        style: {
                                            color: this.props.theme.colors.text,
                                            fontFamily: this.props.theme.fonts.regular,
                                            fontSize: 16,
                                        },
                                        underlineColorAndroid: 'transparent',
                                    }}

                                    style={{
                                        viewContainer: {
                                            height: 30,
                                            alignItems: 'stretch',
                                            borderBottomColor: this.props.theme.colors.accent,
                                            borderBottomWidth: 1.5,
                                        },
                                        inputIOSContainer: {
                                            height: 30,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        },
                                    }}
                                />
                            </View>

                            <EMail
                                subtitle={I18N.format(I18N.Screen_SignIn.email, { name: this.state.family })}
                            />

                            <View style={styles.inputContainer}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Input
                                        placeholder={I18N.format(I18N.Screen_SignIn.placeholderEMail, { name: this.state.family }).toLowerCase()}
                                        value={this.state.username}
                                        textContentType="emailAddress"
                                        onChangeText={this._changeText}
                                        placeholderTextColor={this.props.theme.colors.placeholder}
                                        style={{
                                            borderBottomColor: this.props.theme.colors.accent,
                                            color: this.props.theme.colors.text,
                                        }}
                                    />
                                    <View style={{
                                        marginBottom: 0,
                                        marginLeft: 4,
                                        minWidth: 20,
                                    }}>
                                        {matches && (
                                            <Ionicons
                                                size={24}
                                                style={{ color: this.props.theme.colors.accent }}
                                                name="md-checkmark-circle"
                                            />
                                        )}
                                    </View>
                                </View>
                                {this.state.username != null && this.state.username !== '' && (
                                    <View style={{ flexDirection: 'row' }}>
                                        {
                                            loginParts.map((p, i) => (
                                                <Text
                                                    key={i.toString()}
                                                    style={[styles.hint, { color: i <= matchingPart ? this.props.theme.colors.accent : undefined }]}
                                                >
                                                    {I18N.format(p, { name: this.state.family }).toLowerCase()}
                                                </Text>
                                            ))
                                        }
                                    </View>
                                )}
                            </View>

                            <View style={[styles.buttonContainer]}>
                                <Button
                                    color={this.props.theme.colors.accent}
                                    style={{ ...styles.button }}
                                    mode="contained"
                                    onPress={this._signInOrUp}
                                    loading={this.state.working}
                                    disabled={!this.state.username || this.state.working}
                                >
                                    {I18N.Screen_SignIn.continue}
                                </Button>
                            </View>

                            {this.state.error && (
                                <View style={[styles.errorMessage]}>
                                    <Text style={{ color: this.props.theme.colors.error }}>{this.state.error}</Text>
                                </View>
                            )}

                            <View style={styles.demo}>
                                <TouchableWithoutFeedback onPress={this._demo}>
                                    <Text style={[styles.demoText, { color: this.props.theme.colors.accent }]}>{I18N.Screen_SignIn.demoMode}</Text>
                                </TouchableWithoutFeedback>

                                <TouchableWithoutFeedback onPress={this._lauchJoin}>
                                    <Text style={[styles.demoText, { color: this.props.theme.colors.accent }]}>{I18N.Screen_SignIn.join}</Text>
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
