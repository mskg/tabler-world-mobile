import { Ionicons } from '@expo/vector-icons';
import React, { Component } from 'react';
import { WebView } from 'react-native';
import { Appbar, withTheme } from 'react-native-paper';
import { Audit } from "../analytics/Audit";
import { IAuditor } from '../analytics/Types';
import { Categories, Logger } from '../helper/Logger';
import { ScreenWithHeader } from './Screen';

const logger = new Logger(Categories.UIComponents.WebScreen);
export class WebScreenBase extends Component<{theme, url, title}, {url}> {
    audit: IAuditor;
    ref;

    constructor(props) {
        super(props);

        this.state = {
            url: this.props.url
        }

        this.audit = Audit.screen("Web");
    }

    componentDidMount() {
        this.audit.setParam("title", this.props.title);
        this.audit.setParam("url", this.props.url);
        this.audit.submit();
    }

    render() {
        logger.debug("url", this.props.url);

        return (
            <ScreenWithHeader header={{
                content: [
                    <Appbar.Content key="content" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={this.props.title} />,

                    <Appbar.Action key="home"
                        icon={({size, color}) => <Ionicons name="ios-home" color={color} size={size} />}
                        onPress={() => this.setState({url: this.props.url + "?req=" + Date.now()}) } />,

                    <Appbar.Action key="back"
                        // style={{margin: 0, marginLeft: 6}}
                        icon={({size, color}) => <Ionicons name="ios-arrow-back" color={color} size={size} />}
                        onPress={() => this.ref.goBack()} />,

                    <Appbar.Action key="forward"
                        // style={{margin: 0, marginRight: 6}}
                        icon={({size, color}) => <Ionicons name="ios-arrow-forward" color={color} size={size} />}
                        onPress={() => this.ref.goForward()}
                    />,
                ],
                title: this.props.title
            }}>
                <WebView
                    ref={r => this.ref = r}
                    startInLoadingState={true}
                    source={{
                        uri: this.state.url,
                    }}
                    mixedContentMode={"never"}
                />
            </ScreenWithHeader>
        );
    }
}

export const WebScreen = withTheme(WebScreenBase);