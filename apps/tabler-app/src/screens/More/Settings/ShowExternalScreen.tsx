import React from 'react';
import { withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { WebScreen } from '../../../components/WebScreen';

class ShowExternalScreenBase extends AuditedScreen<{ theme } & NavigationInjectedProps> {
    constructor(props) {
        super(props, AuditScreenName.ShowExternal);
    }

    componentDidMount() {
        this.audit.submit({
            [AuditPropertyNames.Title]: this.props.navigation.getParam('title'),
        });
    }

    render() {
        return (
            <WebScreen
                showBack={true}
                title={this.props.navigation.getParam('title')}
                url={this.props.navigation.getParam('source')}
            />
        );
    }
}

export const ShowExternalScreen = withNavigation(
    withTheme(ShowExternalScreenBase));
