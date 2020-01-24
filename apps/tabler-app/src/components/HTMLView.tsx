import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Theme, withTheme } from 'react-native-paper';
import HTML from 'react-native-render-html';
import { _constructStyles } from 'react-native-render-html/src/HTMLStyles';
import { WebView } from 'react-native-webview';
import HTMLImage from './HTMLImage';

type State = {};

type Props = {
    html: string,
    theme: Theme,
    maxWidth: number,
    skipIFrames?: boolean,
};

class HTMLViewBase extends React.Component<Props, State> {
    render() {
        return (
            <HTML
                staticContentMaxWidth={this.props.maxWidth}
                imagesMaxWidth={this.props.maxWidth}

                html={this.props.html}

                allowFontScaling={false}
                baseFontStyle={{
                    fontFamily: this.props.theme.fonts.regular,
                    color: this.props.theme.colors.text,
                    // fontSize: 12,
                }}

                onLinkPress={async (_a, url, _other) => await WebBrowser.openBrowserAsync(url)}

                tagsStyles={
                    {
                        p: { paddingBottom: 8, margin: 0 },
                        a: { color: this.props.theme.colors.accent },
                        // h2: { color: this.props.theme.colors.text },
                        // h4: { color: this.props.theme.colors.text },
                        // h5: { color: this.props.theme.colors.text },
                        b: {
                            fontFamily: this.props.theme.fonts.medium,
                        },
                        strong: {
                            fontFamily: this.props.theme.fonts.medium,
                        },
                    }
                }

                renderers={{
                    img: (htmlAttribs, _children, _convertedCSSStyles, passProps = {}) => {
                        if (!htmlAttribs.src) {
                            return false;
                        }

                        const style = _constructStyles({
                            htmlAttribs,
                            passProps,
                            tagName: 'img',
                            styleSet: 'IMAGE',
                        });

                        const { src, width, height } = htmlAttribs;

                        return (
                            <HTMLImage
                                source={{ uri: src }}
                                width={width}
                                height={height}
                                style={style}

                                {...passProps}
                            />
                        );
                    },

                    iframe: (htmlAttribs, _children, _convertedCSSStyles, passProps) => {
                        if (this.props.skipIFrames) return false;

                        const { staticContentMaxWidth } = passProps;
                        const { height, width } = htmlAttribs;

                        let newHeight = 200;
                        const newWidth = this.props.maxWidth;

                        // recalculate width based on factoring with new widtth
                        if (height && width) {
                            newHeight = height * (staticContentMaxWidth / width);
                        }

                        const source = htmlAttribs.srcdoc ? { html: htmlAttribs.srcdoc } : { uri: htmlAttribs.src };

                        return (
                            <WebView
                                mediaPlaybackRequiresUserAction={true}
                                startInLoadingState={true}
                                key={passProps.key}
                                source={source}
                                style={{ width: newWidth, height: newHeight }}
                            />
                        );
                    },
                }}
            />
        );
    }
}

export const HTMLView = withTheme(HTMLViewBase);
