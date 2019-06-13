import React from 'react';
import { WebView } from 'react-native';
import { withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { Audit } from "../../analytics/Audit";
import { IAuditor } from '../../analytics/Types';
import { ScreenWithHeader } from '../../components/Screen';

export class ShowExternalScreenBase extends React.PureComponent<{ theme } & NavigationInjectedProps> {
    audit: IAuditor;

    constructor(props) {
        super(props);

        this.audit = Audit.screen("Show External");
    }

    componentDidMount() {
        this.audit.setParam("title", this.props.navigation.getParam("title"));
        this.audit.submit();
    }

    render() {
        return (
            <ScreenWithHeader header={{
                title: this.props.navigation.getParam("title"),
                showBack: true,
            }}>
                <WebView
                    startInLoadingState={true}
                    source={{uri: this.props.navigation.getParam("source")}}
                    mixedContentMode={"never"}
                />
            </ScreenWithHeader>
        );
    }
}

export const ShowExternalScreen = withNavigation(withTheme(ShowExternalScreenBase));