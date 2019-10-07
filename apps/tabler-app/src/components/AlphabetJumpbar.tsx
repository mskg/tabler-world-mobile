import React, { Component } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AlphabetSrollBarPointer } from './AlphabetScrollBarPointer';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

type AlphabeticScrollBarProps = {
    reverse: boolean,
    isPortrait: boolean,

    font?: string,
    fontColor: string,
    fontSize: number,
    supports?: string[]

    top?: number,
    scrollBarContainerStyle?: any

    onScroll?: (letter: string, top: number) => void,
    onScrollEnds?: (letter: string | undefined) => void,
};

type State = {
    activeLetter: string | undefined,
    alphabet: string[],
    activeLetterViewTop: number | undefined,
};

// tslint:disable-next-line: export-name
export class AlphabeticScrollBar extends Component<AlphabeticScrollBarProps, State> {
    alphabetContainer;
    panResponder;
    containerTop!: number;
    containerHeight!: number;

    constructor(props) {
        super(props);

        this.state = {
            activeLetter: undefined,
            activeLetterViewTop: undefined,
            alphabet: props.reverse ? [...ALPHABET].reverse() : ALPHABET,
        };
    }

    componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: this.handleOnFingerTouch.bind(this), // debounce?
            onPanResponderMove: this.handleOnFingerMove.bind(this), // debounce?
            onPanResponderTerminate: this.handleOnFingerStop.bind(this),
            onPanResponderRelease: this.handleOnFingerStop.bind(this),
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.reverse !== this.props.reverse) {
            const alphabet = newProps.reverse ? [...ALPHABET].reverse() : ALPHABET;

            this.setState({
                alphabet,
            });
        }
    }

    getTouchedLetter(y) {
        const top = y - (this.containerTop || 0) - 5;

        if (top >= 1 && top <= this.containerHeight) {
            this.setState({
                activeLetterViewTop: y
                    - (
                        this.props.top || 0
                    ),
            });

            return this.state.alphabet[Math.round((top / this.containerHeight) * this.state.alphabet.length)
            ];
        }

        return undefined;
    }

    handleOnFingerTouch(_e, gestureState) {
        this.handleOnTouchLetter(this.getTouchedLetter(gestureState.y0));
    }

    handleOnFingerMove(_evt, gestureState) {
        this.handleOnTouchLetter(this.getTouchedLetter(gestureState.moveY));
    }

    handleOnTouchLetter(activeLetter) {
        if (!!(this.props.supports || ALPHABET).find((s) => s === activeLetter)) {
            this.setState({ activeLetter });
            if (this.props.onScroll) { this.props.onScroll(activeLetter, this.state.activeLetterViewTop as number); }
        }
    }

    handleOnFingerStop() {
        if (this.props.onScrollEnds) { this.props.onScrollEnds(this.state.activeLetter); }
        this.setState({ activeLetter: undefined });
    }

    _handleOnLayout = () => {
        this.alphabetContainer.measure((_x1, _y1, _width, height, _px, py) => {
            if (!this.containerTop && !this.containerHeight) {
                this.containerTop = py;
                this.containerHeight = height;
            }
        });
    }

    render() {
        return (
            <>
                <View
                    style={[
                        styles.main,
                        { top: this.props.top || 0 },
                    ]}
                >
                    <View
                        ref={(elem) => this.alphabetContainer = elem}
                        {...this.panResponder.panHandlers}
                        onLayout={this._handleOnLayout}
                        style={[
                            styles.container,
                            this.props.scrollBarContainerStyle,
                        ]}
                    >
                        {this.state.alphabet.map((letter) => (
                            <View key={letter}>
                                <Text
                                    style={[
                                        styles.letter,
                                        this.props.font ? {
                                            fontFamily: this.props.font,
                                        } : {},
                                        this.props.fontColor ? {
                                            color:
                                                // !!(this.props.supports || ALPHABET).find(s => s == letter) ?
                                                this.props.fontColor,
                                            // : "grey"
                                        } : {},
                                        { fontSize: this.props.fontSize },
                                    ]}
                                >
                                    {letter}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {this.state.activeLetter && this.state.activeLetterViewTop
                        ? (
                            <AlphabetSrollBarPointer
                                letter={this.state.activeLetter}
                                top={this.state.activeLetterViewTop}
                                style={{ backgroundColor: this.props.fontColor }}
                            />
                        )
                        : null
                    }
                </View>
            </>
        );
    }
}

const styles = StyleSheet.create({
    main: {
        position: 'absolute',

        bottom: 0,
        right: 0,

        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: 25,
        right: 0,
        // bottom: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    letter: {
        // marginVertical: 1
        alignSelf: 'center',
        fontWeight: 'bold',
    },
});
