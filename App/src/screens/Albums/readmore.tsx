import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from 'react-native-paper';
import { I18N } from '../../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';

type State = {
    shouldShowReadMore: boolean,
    showAllText: boolean
}

type VoidFunc = () => void;

type Props = {
    maxHeight: number,
    children: any,

    onReady?: VoidFunc;
    renderTruncatedFooter?: (click: VoidFunc) => void;
    renderRevealedFooter?: (click: VoidFunc) => void;
}

export class ReadMore extends React.Component<Props, State> {
    _isMounted: boolean = false;
    _text: any;

    state = {
        shouldShowReadMore: false,
        showAllText: false
    };

    async componentDidMount() {
        this._isMounted = true;
        await nextFrameAsync();

        if (!this._isMounted) {
            return;
        }

        // Get the height of the text with no restriction on number of lines
        const fullHeight = await measureHeightAsync(this._text);

        await nextFrameAsync();
        if (!this._isMounted) {
            return;
        }

        // Get the height of the text now that number of lines has been set
        // const limitedHeight = await measureHeightAsync(this._text);
        if (fullHeight > this.props.maxHeight) {
            this.setState({
                shouldShowReadMore: true
            },
                () => {
                    this.props.onReady && this.props.onReady();
                }
            );
        } else {
            this.props.onReady && this.props.onReady();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <View>
                <View
                    style={{
                        height: this.state.shouldShowReadMore && !this.state.showAllText
                            ? this.props.maxHeight
                            : undefined,
                        overflow: "hidden"
                    }}

                    ref={(ref) => {
                        this._text = ref
                    }}
                >
                    {this.props.children}
                </View >
                {this._maybeRenderReadMore()}
            </View>
        );
    }

    _handlePressReadMore = () => {
        this.setState({ showAllText: true });
    };

    _handlePressReadLess = () => {
        this.setState({ showAllText: false });
    };

    _maybeRenderReadMore() {
        let { shouldShowReadMore, showAllText } = this.state;

        if (shouldShowReadMore && !showAllText) {
            if (this.props.renderTruncatedFooter) {
                return this.props.renderTruncatedFooter(this._handlePressReadMore);
            }

            return (
                <Text style={styles.button} onPress={this._handlePressReadMore}>
                    {I18N.ReadMore.more}
                </Text>
            );
        } else if (shouldShowReadMore && showAllText) {
            if (this.props.renderRevealedFooter) {
                return this.props.renderRevealedFooter(this._handlePressReadLess);
            }

            return (
                <Text style={styles.button} onPress={this._handlePressReadLess}>
                    {I18N.ReadMore.less}
                </Text>
            );
        }
    }
}

function measureHeightAsync(c): Promise<number> {
    return new Promise(resolve => {
        c.measure((_x: number, _y: number, _w: number, h: number) => {
            resolve(h);
        });
    });
}

function nextFrameAsync(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

const styles = StyleSheet.create({
    button: {
        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
        marginTop: 5
    }
});