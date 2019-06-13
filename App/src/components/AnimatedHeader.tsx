 import React, { Component } from 'react';
import { Animated, Dimensions, Platform, RefreshControl, StatusBar, StyleSheet, View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { Categories, Logger } from '../helper/Logger';

const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
const logger = new Logger(Categories.UIComponents.Animated);

type Props = {
    theme: Theme,
    height: number,
    minHeight?: number,
    useNativeDriver?: boolean,

    renderContent(): any,
    renderHeader(scrollY: Animated.AnimatedAddition, distance: number): any,
    refresh?: () => Promise<void>,
}

class AnimatedHeaderBase extends Component<Props> {
    state = {
        scrollY: null as unknown as Animated.Value,
        refreshing: false,
        minHeight: 0,
    };

    constructor(props) {
        super(props);

        this.state.scrollY = new Animated.Value(
            // iOS has negative initial scroll value because content inset...
            Platform.OS === 'ios' ? -this.props.height : 0,
        );
    }

    _onLayout = event => {
        // logger.log(event.nativeEvent.layout);
        if (this.state.minHeight !== 0) return;

        const windowHeight = Dimensions.get('window').height;
        const { height } = event.nativeEvent.layout;

        let minHeight = 0;

        if (Platform.OS === "ios") {
            minHeight = windowHeight - (this.props.minHeight || HEADER_MIN_HEIGHT);
        } else {
            minHeight = windowHeight
                + (this.props.minHeight || HEADER_MIN_HEIGHT)
                - (StatusBar.currentHeight || 0);
        }

        logger.debug(
            "window height", Dimensions.get('window').height,
            "content height", height,

            "header height", this.props.height,
            "header min", this.props.minHeight,

            "content min", minHeight);

        this.setState({ minHeight: minHeight });
    }

    _scrollView;
    onScrollEndSnapToEdge = event => {
        const scrollRangeForAnimation = 340;

        const y = -1 * event.nativeEvent.contentOffset.y;
        // logger.log(y, this.props.height);

        // if (y < scrollRangeForAnimation) {
        //     this._scrollView.scrollTo({ y: 0 });
        // }

        // else {
        //     this._scrollView.scrollTo({ y: -this.props.height});
        // }
        logger.debug("onScrollEndSnapToEdge", y, scrollRangeForAnimation);


        if (y < scrollRangeForAnimation && y > 200) {
            logger.debug("adjust");

            if (this._scrollView) {
                setImmediate(() => this._scrollView.scrollTo({ y: -this.props.height }));
            }
        } else if (y < scrollRangeForAnimation) {
            logger.debug("adjust");

            if (this._scrollView) {
                setImmediate(() => this._scrollView.scrollTo({ y: -this.props.height }));
            }
        }
        // } else if (scrollRangeForAnimation / 2 <= y && y < scrollRangeForAnimation && y != scrollRangeForAnimation) {

        //     logger.log("b", y, scrollRangeForAnimation);

        //     if (this._scrollView) {
        //         this._scrollView.scrollTo({ y: -1 * scrollRangeForAnimation });
        //     }
        // }
    };

    render() {
        const distance = this.props.height - (this.props.minHeight || HEADER_MIN_HEIGHT);

        const scrollY = Animated.add(
            this.state.scrollY,
            Platform.OS === 'ios' ? this.props.height : 0,
        );

        return (
            <View style={{
                ...AnimateStyles.fill,
                backgroundColor: this.props.theme.colors.surface,
            }}>
                <Animated.ScrollView
                    style={AnimateStyles.fill}
                    scrollEventThrottle={1}
                    ref={scrollView => {
                        this._scrollView = scrollView ? scrollView._component : null;
                    }}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                        { useNativeDriver: this.props.useNativeDriver || false },
                    )}

                    // onScrollEndDrag={this.onScrollEndSnapToEdge}
                    // onMomentumScrollEnd={this.onScrollEndSnapToEdge}

                    refreshControl={
                        this.props.refresh == null ? null
                            : <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={async () => {
                                    if (this.props.refresh != null) {
                                        this.setState({ refreshing: true });
                                        await this.props.refresh();
                                        this.setState({ refreshing: false });
                                    }
                                }}
                                progressViewOffset={this.props.height}
                            />
                    }
                    // iOS offset for RefreshControl
                    contentInset={{
                        top: this.props.height,
                    }}
                    contentOffset={{
                        y: -this.props.height,
                    }}
                >
                    <View style={{
                        ...AnimateStyles.scrollViewContent,
                        minHeight: this.state.minHeight,
                        // iOS uses content inset, which acts like padding.
                        paddingTop: Platform.OS !== 'ios' ? this.props.height : 0,
                        paddingBottom: (StatusBar.currentHeight || 0),
                        // backgroundColor: this.props.theme.colors.surface,
                    }} onLayout={this._onLayout}>
                        {this.props.renderContent()}
                    </View>
                </Animated.ScrollView>

                {this.props.renderHeader(scrollY, distance)}
            </View>
        );
    }
}

export const AnimatedHeader = withTheme(AnimatedHeaderBase);

export const AnimateStyles = StyleSheet.create({
    fill: {
        flex: 1,
    },

    scrollViewContent: {
    },
});
