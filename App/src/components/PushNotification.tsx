import React, { Component } from 'react';
import { Animated, Dimensions, Image, ImageSourcePropType, PanResponder, PanResponderInstance, Platform, StatusBar, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Portal, Surface, Text, Theme, Title, withTheme } from 'react-native-paper';
import { isIphoneX } from '../helper/isIphoneX';
import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.UIComponents.Notifications);

// enable debug messages (pan, drag, etc.)
const DEBUG_UI = false;

const CONTAINER_MARGIN_TOP =
    Platform.OS === 'ios'
        ? isIphoneX()
            ? 44
            : 20
        : (StatusBar.currentHeight || 0) + 10;

const HORIZONTAL_MARGIN = 8;

const SLIDE_OUT_OFFSET = -30;

const SLIDE_DURATION = 400;
const TIMEOUT = 4000;

type State = {
    show: boolean,

    containerSlideOffsetY: Animated.Value,
    slideOutTimer: any,

    // drag
    containerDragOffsetY: Animated.Value,

    // press
    containerScale: Animated.Value,

    message?: Message,
}

type Props = {
    theme: Theme,
}

type Message = {
    onPress?: () => void,
    onDismiss?: () => void,

    icon: ImageSourcePropType,
    appName?: string,
    time?: string,
    title?: string,
    body?: string,
}

export class PushNotificationBase extends Component<Props, State> {
    _panResponder: PanResponderInstance;

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            containerSlideOffsetY: new Animated.Value(0),
            slideOutTimer: null,
            containerDragOffsetY: new Animated.Value(0),
            containerScale: new Animated.Value(1),
        };

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (e, gestureState) => true,
            // onStartShouldSetPanResponderCapture: (e, gestureState) => false,

            onMoveShouldSetPanResponder: (e, gestureState) => true,
            // onMoveShouldSetPanResponderCapture: (e, gestureState) => false,

            onPanResponderGrant: this._onPanResponderGrant,
            onPanResponderMove: this._onPanResponderMove,
            onPanResponderRelease: this._onPanResponderRelease,
        });
    }

    _onPanResponderGrant = (_e, gestureState) => {
        DEBUG_UI && logger.debug('_onPanResponderGrant', gestureState);
        this._onPressInFeedback();
    }

    _onPanResponderMove = (_e, gestureState) => {
        DEBUG_UI && logger.debug('_onPanResponderMove', gestureState);
        const { containerDragOffsetY } = this.state;

        // Prevent dragging down too much
        const newDragOffset = gestureState.dy < 100 ? gestureState.dy : 100;  // TODO: customize
        containerDragOffsetY.setValue(newDragOffset);
    }

    _onPanResponderRelease = (_e, gestureState) => {
        DEBUG_UI && logger.debug('_onPanResponderRelease', gestureState);
        const { containerDragOffsetY } = this.state;

        // Present feedback
        this._onPressOutFeedback();

        // Check if it is onPress
        // Currently tolerate +-2 movement
        // Note that "move around, back to original position, release" still triggers onPress
        if (gestureState.dy <= 2 && gestureState.dy >= -2 && gestureState.dx <= 2 && gestureState.dx >= -2) {
            this._onPress();
        }

        // Check if it is leaving the screen
        if (containerDragOffsetY._value < SLIDE_OUT_OFFSET) {
            // 1. If leaving screen -> slide out
            this._slideOutAndDismiss(SLIDE_DURATION);
        } else {
            // 2. If not leaving screen -> slide back to original position
            this.clearTimerIfExist();
            Animated.timing(containerDragOffsetY, { toValue: 0, duration: SLIDE_DURATION })
                .start(({ finished }) => {
                    // Reset a new countdown
                    this._countdownToSlideOut();
                });
        }
    }

    /**
     * Show feedback as soon as user press down
     */
    _onPressInFeedback = () => {
        DEBUG_UI && logger.debug('PressIn!');
        const { containerScale } = this.state;

        Animated
            .spring(containerScale, { toValue: 0.95, friction: 8 })
            .start();
    }

    /**
     * Show feedback as soon as user press down
     */
    _onPressOutFeedback = () => {
        DEBUG_UI && logger.debug('PressOut!');
        const { containerScale } = this.state;

        Animated
            .spring(containerScale, { toValue: 1, friction: 8 })
            .start();
    }

    _onPress = () => {
        // slide out
        this._slideOutAndDismiss(SLIDE_DURATION);

        // Run callback
        if (this.state.message && this.state.message.onPress) {
            this.state.message.onPress();
        }
    }

    clearTimerIfExist() {
        const { slideOutTimer } = this.state;
        if (slideOutTimer) { clearTimeout(slideOutTimer); }
    }

    _slideIn = (duration?) => {
        const { containerSlideOffsetY } = this.state;

        Animated
            .timing(containerSlideOffsetY, { toValue: 1, duration: duration || SLIDE_DURATION, })
            .start(() => {
                this._countdownToSlideOut();
            });
    }

    _countdownToSlideOut = () => {
        const slideOutTimer = setTimeout(() => {
            this._slideOutAndDismiss();
        }, TIMEOUT);

        this.setState({ slideOutTimer });
    }

    _slideOutAndDismiss = (duration?) => {
        const { containerSlideOffsetY } = this.state;

        Animated
            .timing(containerSlideOffsetY, { toValue: 0, duration: duration || SLIDE_DURATION, })
            .start(() => {
                if (this.state.message && this.state.message.onDismiss != null) { this.state.message.onDismiss(); }
                this.setState({ show: false });
            });
    }

    public showMessage(message: Message) {
        this.clearTimerIfExist();

        this.setState({
            show: true,

            containerSlideOffsetY: new Animated.Value(0),
            slideOutTimer: null,

            containerDragOffsetY: new Animated.Value(0),
            containerScale: new Animated.Value(1),

            message: message,
        }, this._slideIn);
    }

    render() {
        const {
            show, containerSlideOffsetY, containerDragOffsetY, containerScale,
            message,
        } = this.state;

        if (!show || !message) {
            return null;
        }

        const slideOffsetYToTranslatePixelMapping = {
            inputRange: [0, 1],
            outputRange: [-150, 0]
        };

        const slideInAnimationStyle = {
            transform: [
                { translateY: containerSlideOffsetY.interpolate(slideOffsetYToTranslatePixelMapping) },
                { translateY: containerDragOffsetY },
                { scale: containerScale },
            ],
        };

        const animatedContainerStyle = [
            styles.container,
            slideInAnimationStyle,
        ];

        return (
            <Portal>
                <Animated.View
                    style={animatedContainerStyle}
                    {...this._panResponder.panHandlers}
                >
                    <TouchableWithoutFeedback onPress={this._onPress}>
                        <Surface style={{ ...styles.surface, backgroundColor: this.props.theme.colors.primary }}>
                            <View>
                                <View style={{ ...styles.header }}>
                                    <View style={styles.headerIconContainer}>
                                        {message.icon && <Image style={styles.headerIcon} source={message.icon} />}
                                    </View>
                                    <View style={styles.headerTextContainer}>
                                        <Text style={styles.headerText} numberOfLines={1}>{message.appName || ''}</Text>
                                    </View>
                                    <View style={styles.headerTimeContainer}>
                                        <Text style={styles.headerTime} numberOfLines={1}>{message.time || ''}</Text>
                                    </View>
                                </View>
                                <View style={styles.contentContainer}>
                                    {message.title &&
                                        <View style={styles.contentTitleContainer}>
                                            <Title style={styles.contentTitle}>{message.title}</Title>
                                        </View>
                                    }
                                    <View style={styles.contentTextContainer}>
                                        <Text style={styles.contentText}>{message.body || ''}</Text>
                                    </View>
                                </View>
                            </View>
                        </Surface>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </Portal>
        );
    }
}

export const PushNotification = withTheme(PushNotificationBase);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',

        width: Dimensions.get('window').width - (HORIZONTAL_MARGIN * 2),

        left: HORIZONTAL_MARGIN,
        right: HORIZONTAL_MARGIN,

        top: CONTAINER_MARGIN_TOP,
    },

    surface: {
        borderRadius: 12,
        elevation: 3,
    },

    header: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerIconContainer: {
        height: 20,
        width: 20,
        marginLeft: 12,
        marginRight: 8,
        borderRadius: 4,
    },

    headerIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },

    headerTextContainer: {
        flex: 1,
    },

    headerText: {
        fontSize: 12,
    },

    headerTimeContainer: {
        marginHorizontal: 16,
    },

    headerTime: {
        fontSize: 12,
        lineHeight: 14,
    },

    contentContainer: {
        width: '100%',
        paddingBottom: 10,
        paddingHorizontal: 12,
    },

    contentTitleContainer: {
    },

    contentTitle: {
        fontSize: 12,
        lineHeight: 14,
    },

    contentTextContainer: {
    },

    contentText: {
        fontSize: 12,
    },
});