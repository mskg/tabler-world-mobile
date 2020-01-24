import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import React from 'react';
import { Animated, Dimensions, Easing, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Portal, Surface, Text, Theme, Title, TouchableRipple, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { ActionNames } from '../analytics/ActionNames';
import { Audit } from '../analytics/Audit';
import { AuditScreenName } from '../analytics/AuditScreenName';
import { Categories, Logger } from '../helper/Logger';
import { showSupportForm } from '../helper/showSupportForm';
import { I18N } from '../i18n/translation';
import { showFeedback } from '../redux/actions/navigation';

const logger = new Logger(Categories.UIComponents.ErrorReport);

const SHAKE_SPEED = 350;
class ShakeEvent {
    // tslint:disable-next-line: function-name
    static addListener(handler) {
        // tslint:disable: variable-name
        let last_x;
        let last_y;
        let last_z;

        let lastUpdate = 0;

        Accelerometer.setUpdateInterval(100);
        Accelerometer.addListener((accelerometerData) => {
            const { x, y, z } = accelerometerData;
            const currTime = Date.now();

            if ((currTime - lastUpdate) > 100) {
                const diffTime = (currTime - lastUpdate);
                lastUpdate = currTime;

                const speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;

                if (speed > SHAKE_SPEED) {
                    logger.log('sensor', 'shake detected w/ speed: ' + speed);
                    handler();
                }

                last_x = x;
                last_y = y;
                last_z = z;
            }
        });
    }

    // tslint:disable-next-line: function-name
    static removeListener() {
        Accelerometer.removeAllListeners();
    }
}

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

// Height of the dialog from bottom
const HEIGHT = 300 + 16;

// How many miliseconds to automatically close the dialog
const TIMEOUT = 8000;

type Props = {
    theme: Theme,
    showFeedback: typeof showFeedback,
};

type State = {
    open: boolean,
};

// tslint:disable-next-line: max-classes-per-file
class ErrorReportBase extends React.Component<Props, State> {
    static instance?: ErrorReportBase;

    // tslint:disable-next-line: function-name
    static Show() {
        if (ErrorReportBase.instance) {
            ErrorReportBase.instance._open();
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };

        this.mounted = true;
        ShakeEvent.addListener(this._open);

        ErrorReportBase.instance = this;
    }

    mounted = false;
    audit = Audit.screen(AuditScreenName.ErrorReport);

    componentWillUnmount() {
        this.mounted = false;
        ShakeEvent.removeListener();
    }

    animatedValue = new Animated.Value(0);
    twiggle?: Animated.CompositeAnimation;
    closeAction?: number;

    twiggleIcon = () => {
        // if (this.twiggle == null) {
        // A loop is needed for continuous animation
        this.twiggle = Animated.loop(
            // Animation consists of a sequence of steps
            Animated.sequence([
                // start rotation in one direction (only half the time is needed)
                Animated.timing(this.animatedValue, { toValue: 1.0, duration: 150, easing: Easing.linear, useNativeDriver: true }),
                // rotate in other direction, to minimum value (= twice the duration of above)
                Animated.timing(this.animatedValue, { toValue: -1.0, duration: 300, easing: Easing.linear, useNativeDriver: true }),
                // return to begin position
                Animated.timing(this.animatedValue, { toValue: 0.0, duration: 150, easing: Easing.linear, useNativeDriver: true }),
            ]),
        );
        // }

        this.twiggle.start();
    }

    bounceValue = new Animated.Value(HEIGHT);

    _slide = () => {
        this.bounceValue.setValue(this.state.open ? HEIGHT : 0);

        Animated.spring(
            this.bounceValue,
            {
                toValue: this.state.open ? 0 : HEIGHT,
                velocity: 3,
                tension: 2,
                friction: 8,
                // speed: 12,
            },
        ).start();

        this.twiggleIcon();
    }

    _open = () => {
        if (!this.state.open) {
            if (this.closeAction) { clearTimeout(this.closeAction); this.closeAction = undefined; }
            this.audit.submit();

            this.setState({ open: true }, this._slide);

            this.closeAction = setTimeout(
                () => {
                    this.audit.trackAction(ActionNames.Timeout);
                    this._close();
                },
                TIMEOUT);
        }
    }

    _close = () => {
        if (this.closeAction) { clearTimeout(this.closeAction); this.closeAction = undefined; }
        if (!this.mounted) { return; }

        if (this.state.open) {
            if (this.twiggle) { this.twiggle.stop(); }
            this.setState({ open: false }, this._slide);
        }
    }

    _runFeedback = async () => {
        try {
            this.props.showFeedback();
        } finally {
            this._close();
        }
    }

    _runSupport = async () => {
        try {
            showSupportForm();
        } finally {
            this._close();
        }
    }

    render() {
        return (
            <Portal>
                {this.state.open && (
                    <TouchableWithoutFeedback onPress={this._close}>
                        <View style={styles.shade} />
                    </TouchableWithoutFeedback>
                )}

                <Surface
                    // @ts-ignore transform seems not to exist?
                    style={[
                        styles.container,
                        { transform: [{ translateY: this.bounceValue }] },
                    ]}
                >
                    <Title>{I18N.ErrorReport.title}</Title>
                    <Text>{I18N.ErrorReport.text}</Text>

                    <AnimatedIcon
                        name="md-phone-portrait"
                        size={64 + 32}
                        style={[
                            {
                                transform: [{
                                    rotate: this.animatedValue.interpolate({
                                        inputRange: [-1, 1],
                                        outputRange: ['-0.1rad', '0.1rad'],
                                    }),
                                }],
                                color: this.props.theme.colors.accent,
                            },
                            styles.icon,
                        ]}
                    />

                    <TouchableRipple style={styles.touch} onPress={this._runFeedback}>
                        <View style={styles.row}>
                            <View style={styles.rowIcon}>
                                <Ionicons name="md-microphone" size={32} />
                            </View>
                            <Text style={styles.rowText}>{I18N.ErrorReport.feedback}</Text>
                        </View>
                    </TouchableRipple>

                    <TouchableRipple style={styles.touch} onPress={this._runSupport}>
                        <View style={styles.row}>
                            <View style={styles.rowIcon}>
                                <Ionicons name="md-bug" size={32} />
                            </View>
                            <Text style={styles.rowText}>{I18N.ErrorReport.report}</Text>
                        </View>
                    </TouchableRipple>
                </Surface>
            </Portal>
        );
    }
}

const ShakeErrorReport = connect(
    null,
    {
        showFeedback,
    },
)(withTheme(ErrorReportBase));

// tslint:disable-next-line: export-name
export function withSkakeErrorReport(WrappedComponent) {
    // tslint:disable-next-line: max-classes-per-file
    return class extends React.PureComponent {

        render() {
            return (
                <>
                    <WrappedComponent />
                    <ShakeErrorReport />
                </>
            );
        }
    };
}

export function showShakeErrorReport() {
    ErrorReportBase.Show();
}

const styles = StyleSheet.create({
    icon: {
        paddingTop: 24,
        paddingBottom: 24 - 8,
    },

    touch: {
        width: Dimensions.get('window').width,
    },

    rowIcon: {
        width: 32,
        alignItems: 'center',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingLeft: 32,
        paddingBottom: 8,
    },

    rowText: {
        paddingLeft: 16,
        flex: 1,
        flexWrap: 'wrap',
    },

    shade: {
        ...StyleSheet.absoluteFillObject,

        opacity: 0.35,
        backgroundColor: 'black',
    },

    container: {
        elevation: 5,

        bottom: 0,
        height: HEIGHT,
        left: 0,
        right: 0,
        position: 'absolute',

        paddingVertical: 16,
        paddingHorizontal: 16,

        alignItems: 'center',
        borderRadius: 10,
    },
});
