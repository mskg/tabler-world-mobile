import React from 'react';
import { WebView } from 'react-native';
import { withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { ScreenWithHeader } from '../../components/Screen';

class ShowExternalScreenBase extends AuditedScreen<{ theme } & NavigationInjectedProps> {
    constructor(props) {
        super(props, AuditScreenName.ShowExternal);
    }

    componentDidMount() {
        this.audit.submit({ "title": this.props.navigation.getParam("title") });
    }

    render() {
        return (
            <ScreenWithHeader header={{
                title: this.props.navigation.getParam("title"),
                showBack: true,
            }}>
                <WebView
                    startInLoadingState={true}
                    source={{ uri: this.props.navigation.getParam("source") }}
                    mixedContentMode={"never"}
                />
            </ScreenWithHeader>
        );
    }
}

export const ShowExternalScreen = withNavigation(
    withTheme(ShowExternalScreenBase));