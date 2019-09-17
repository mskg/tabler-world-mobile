import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { WebView } from 'react-native';
import { Appbar, Theme, withTheme } from 'react-native-paper';
import { AuditedScreen } from '../analytics/AuditedScreen';
import { AuditPropertyNames } from '../analytics/AuditPropertyNames';
import { AuditScreenName } from '../analytics/AuditScreenName';
import { Categories, Logger } from '../helper/Logger';
import { ScreenWithHeader } from './Screen';

const logger = new Logger(Categories.UIComponents.WebScreen);

type Props = {
    theme: Theme,
    url: string,
    whitelist?: string[],
    title: string,
    showBack?: boolean,
};

type State = {
    url: string;
};

export class WebScreenBase extends AuditedScreen<Props, State> {
    ref: any;

    constructor(props) {
        super(props, AuditScreenName.Web);

        this.state = {
            url: this.props.url,
        };
    }

    componentDidMount() {
        this.audit.setParam(AuditPropertyNames.Title, this.props.title);
        this.audit.setParam(AuditPropertyNames.Url, this.props.url);
        this.audit.submit();

        logger.debug(this.state.url, this.props.whitelist);
    }

    render() {
        logger.debug('url', this.props.url);

        return (
            <ScreenWithHeader
                header={{
                    content: [
                        <Appbar.Content key="content" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={this.props.title} />,

                        <Appbar.Action
                            key="home"
                            icon={({ size, color }) => <Ionicons name="ios-home" color={color} size={size} />}
                            onPress={() => this.setState({ url: `${this.props.url}?req=${Date.now()}` })}
                        />,

                        <Appbar.Action
                            key="back"
                            icon={({ size, color }) => <Ionicons name="ios-arrow-back" color={color} size={size} />}
                            onPress={() => this.ref.goBack()}
                        />,

                        <Appbar.Action
                            key="forward"
                            icon={({ size, color }) => <Ionicons name="ios-arrow-forward" color={color} size={size} />}
                            onPress={() => this.ref.goForward()}
                        />,
                    ],
                    title: this.props.title,
                    showBack: this.props.showBack,
                }}
            >
                <WebView
                    ref={r => this.ref = r}
                    startInLoadingState={true}
                    originWhitelist={this.props.whitelist}
                    source={{
                        uri: this.state.url,
                    }}
                    mixedContentMode={'never'}
                />
            </ScreenWithHeader>
        );
    }
}

export const WebScreen = withTheme(WebScreenBase);
