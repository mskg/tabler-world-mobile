import { Asset } from 'expo-asset';
import React from 'react';
import { ScrollView } from 'react-native';
import { withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import DocViewer from '../../../components/DocsViewer';
import { FullScreenLoading } from '../../../components/Loading';
import { ScreenWithHeader } from '../../../components/Screen';
import { Categories, Logger } from '../../../helper/Logger';

const logger = new Logger(Categories.Screens.Docs);

type State = {
    text?: string,
};
class ShowMDScreenBase extends AuditedScreen<{ theme } & NavigationInjectedProps, State> {
    constructor(props) {
        super(props, AuditScreenName.ShowMD);
        this.state = {};
    }

    async componentDidMount() {
        try {
            this.audit.setParam(AuditPropertyNames.Title, this.props.navigation.getParam('title'));

            const asset = Asset.fromModule(this.props.navigation.getParam('source'));
            await asset.downloadAsync();

            const file = await fetch(asset.uri);
            const text = await file.text();

            this.setState({ text });
        } catch (e) {
            logger.error('md-screen', e, { source: this.props.navigation.getParam('source') });
        }

        this.audit.submit();
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    title: this.props.navigation.getParam('title'),
                    showBack: true,
                }}
            >
                {!this.state.text &&
                    <FullScreenLoading />
                }

                {this.state.text && (
                    <ScrollView style={{ padding: 10, backgroundColor: this.props.theme.colors.surface }}>
                        <DocViewer text={this.state.text} />
                    </ScrollView>
                )}
            </ScreenWithHeader>
        );
    }
}

export const ShowMDScreen = withNavigation(withTheme(ShowMDScreenBase));
