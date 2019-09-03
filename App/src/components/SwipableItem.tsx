// @flow
import React from 'react';
import { Animated, GestureResponderEvent, PanResponder, PanResponderGestureState, PanResponderInstance, Platform, StyleSheet, View, ViewProps } from 'react-native';

type Props = {
    children?: any,
    style?: any,
    swipeContainerStyle?: any,

    leftButtons?: React.ReactElement<SwipeProps>,
    rightButtons?: React.ReactElement<SwipeProps>,
    containerView?: React.ComponentType<ViewProps>,

    onSwipeInitial?: (swipeItem: SwipableItem) => any,
    onLeftButtonsShowed?: (swipeItem: SwipableItem) => any,
    onRightButtonsShowed?: (swipeItem: SwipableItem) => any,
    onMovedToOrigin?: (swipeItem: SwipableItem) => any,
};

type States = {
    panDistance: Animated.ValueXY,
    rightButtonTriggerPosition: number,
    leftButtonTriggerPosition: number,
};

type SwipeProps = {
    children?: any,
    style?: any,
    onLayout?: (evt: { nativeEvent: { layout: { x, y, width, height } } }) => any;
};

export class SwipeButtonsContainer extends React.Component<SwipeProps> {
    render() {
        const {
            style,
            children,
            ...other
        } = this.props;

        return (
            <Animated.View
                style={style}
                {...other}
            >
                {children}
            </Animated.View>
        );
    }
}

// tslint:disable-next-line: max-classes-per-file
export class SwipableItem extends React.Component<Props, States> {

    _swipeItem: SwipableItem = this;
    _panResponder: PanResponderInstance;
    _panDistanceOffset: { x: number, y: number } = { x: 0, y: 0 };

    state: States = {
        panDistance: new Animated.ValueXY(),
        rightButtonTriggerPosition: 0,
        leftButtonTriggerPosition: 0,
    };

    constructor(props: Props) {
        super(props);

        this._panResponder = this._createPanResponderInstance();
        this.state.panDistance.addListener((value) => {
            this._panDistanceOffset = value;
        });
    }

    componentWillUnmount() {
        // @ts-ignore removeAllListeners exists
        this.state.panDistance.removeAllListeners();
    }

    // tslint:disable-next-line: function-name
    _createPanResponderInstance(): PanResponderInstance {
        return PanResponder.create({
            onMoveShouldSetPanResponderCapture: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                if (Math.abs(gestureState.dx) < 5) {
                    return false;
                }
                const {
                    x: offsetX,
                } = this._panDistanceOffset;

                if (Math.round(offsetX) === 0) {
                    if (this.props.onSwipeInitial) { this.props.onSwipeInitial(this._swipeItem); }
                }
                return true;
            },

            onPanResponderGrant: (_evt: GestureResponderEvent, _gestureState: PanResponderGestureState) => {
                // setting pan distance offset, make sure next touch will not jump to touch position immediately
                this.state.panDistance.setOffset(this._panDistanceOffset);
                // initial panDistance
                this.state.panDistance.setValue({ x: 0, y: 0 });
            },

            onPanResponderMove: Animated.event(
                [
                    null,
                    {
                        dx: this.state.panDistance.x,
                    },
                ],
            ),

            onPanResponderRelease: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                this._moveToDestination(this._getSwipePositionDestinationValueX(gestureState.dx));
            },

            onPanResponderTerminate: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                this._moveToDestination(this._getSwipePositionDestinationValueX(gestureState.dx));
                return true;
            },

            onPanResponderTerminationRequest: (_evt: GestureResponderEvent, _gestureState: PanResponderGestureState) => {
                // On Android, the component will stick at the last swipe position when pan responder terminate
                // return true, at onPanResponderTerminate function will move the swipe component to origin position
                if (Platform.OS === 'android') {
                    return true;
                }
                return false;

            },

        });
    }

    /**
     * move the swipe component to destination
     * @param {number} toX the x-axis of move destination
     */
    // tslint:disable-next-line: function-name
    _moveToDestination(toX: number) {
        if (Math.round(toX) === 0) {
            if (this.props.onMovedToOrigin) { this.props.onMovedToOrigin(this._swipeItem); }
        }

        // Merges the offset value into the base value and resets the offset to zero.
        this.state.panDistance.flattenOffset();
        Animated.spring(this.state.panDistance, {
            toValue: {
                x: toX,
                y: 0,
            },
            friction: 10,
        }).start();
    }

    close() {
        this._moveToDestination(0);
    }

    /**
     * get the Swipe component's position after user release gesture
     * @param {number} panDistanceX the distance of x-axis for gesture
     */
    // tslint:disable-next-line: function-name
    _getSwipePositionDestinationValueX(panDistanceX: number): number {
        const {
            leftButtonTriggerPosition,
            rightButtonTriggerPosition,
        } = this.state;

        let toValueX: number = 0;
        const panSide: string = (panDistanceX > 0) ? 'right' : 'left';
        const containerOffset: number = this._panDistanceOffset.x;

        if (panSide === 'right' && containerOffset > leftButtonTriggerPosition) {
            toValueX = leftButtonTriggerPosition;
            if (this.props.onLeftButtonsShowed) { this.props.onLeftButtonsShowed(this._swipeItem); }
        }

        if (panSide === 'left' && containerOffset < rightButtonTriggerPosition) {
            toValueX = rightButtonTriggerPosition;
            if (this.props.onRightButtonsShowed) { this.props.onRightButtonsShowed(this._swipeItem); }
        }

        return toValueX;
    }

    // tslint:disable-next-line: function-name
    _renderleftButtonsIfNotNull(): JSX.Element | null {
        const {
            leftButtons = null,
        } = this.props;

        const {
            leftButtonTriggerPosition,
        } = this.state;

        if (leftButtons == null) {
            return null;
        }

        const {
            style,
            children,
        } = leftButtons.props;

        const scale = this.state.panDistance.x.interpolate({
            inputRange: [-Infinity, -0.01, 0, leftButtonTriggerPosition, Infinity],
            outputRange: [0.01, 0.01, 0.7, 1, 1],
        });

        const widthStyle = {
            transform: [{ scaleX: scale }],
        };

        return (
            <SwipeButtonsContainer
                style={[style, buttonViewStyles.container, buttonViewStyles.left, widthStyle]}
                onLayout={({ nativeEvent }) => {
                    this.setState({
                        leftButtonTriggerPosition: nativeEvent.layout.width,
                    });
                }}
            >
                {children}
            </SwipeButtonsContainer>
        );
    }

    _renderrightButtonsIfNotNull(): JSX.Element | null {
        const {
            rightButtons = null,
        } = this.props;

        const {
            rightButtonTriggerPosition,
        } = this.state;

        if (rightButtons == null) {
            return null;
        }

        const {
            style,
            children,
        } = rightButtons.props;

        const scale = this.state.panDistance.x.interpolate({
            inputRange: [-Infinity, rightButtonTriggerPosition, 0, 0.1, Infinity],
            outputRange: [1, 1, 0.7, 0.01, 0.01],
        });

        const widthStyle = {
            transform: [{ scaleX: scale }],
        };

        return (
            <SwipeButtonsContainer
                style={[style, buttonViewStyles.container, buttonViewStyles.right, widthStyle]}
                onLayout={({ nativeEvent }) => {
                    this.setState({
                        rightButtonTriggerPosition: -1 * nativeEvent.layout.width,
                    });
                }}
            >
                {children}
            </SwipeButtonsContainer>
        );
    }

    render() {
        const panStyle = {
            transform: this.state.panDistance.getTranslateTransform(),
        };

        const {
            style,
            // swipeContainerStyle,
            containerView: ContainerView = View,
        } = this.props;

        return (
            <View>
                <ContainerView
                    style={[
                        style,
                        containerStyles.rootContainer,
                    ]}
                >
                    <View
                        style={[containerStyles.buttonsContainer]}
                    >
                        {this._renderleftButtonsIfNotNull()}
                        {this._renderrightButtonsIfNotNull()}
                    </View>
                    <Animated.View
                        style={[containerStyles.swipeContainer, panStyle]}
                        {...this._panResponder.panHandlers}

                    >
                        {this.props.children}
                    </Animated.View>
                </ContainerView>
            </View>
        );
    }

}

const containerStyles = StyleSheet.create({
    rootContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },

    buttonsContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        flexDirection: 'row',
        top: 0,
        left: 0,
    },

    swipeContainer: {
        height: '100%',
        width: '100%',
    },
});

const buttonViewStyles = StyleSheet.create({
    container: {
        position: 'absolute',
    },

    left: {
        left: 0,
        top: 0,
        height: '100%',
    },

    right: {
        right: 0,
        top: 0,
        height: '100%',
    },
});
