import { Asset } from 'expo-asset';
import React from 'react';
import { ScrollView } from 'react-native';
import { withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { Audit } from "../../analytics/Audit";
import { IAuditor } from '../../analytics/Types';
import DocViewer from '../../components/DocsViewer';
import { ScreenWithHeader } from '../../components/Screen';
import { Categories, Logger } from '../../helper/Logger';

const logger = new Logger(Categories.Screens.Docs);

type State = {
    text: string,
}
export class ShowMDScreenBase extends React.PureComponent<{ theme } & NavigationInjectedProps, State> {
    audit: IAuditor;

    constructor(props) {
        super(props)
        this.state = {
            text: "Loading...",
        }

        this.audit = Audit.screen("Show MD");
    }

    async componentDidMount() {
        try {
            this.audit.setParam("title", this.props.navigation.getParam("title"));

            let asset = Asset.fromModule(this.props.navigation.getParam("source"));
            await asset.downloadAsync();

            const file = await fetch(asset.uri);
            const text = await file.text();

            this.setState({ text });
        }
        catch (e) {
            logger.error(e, "Failed to load MD " + this.props.navigation.getParam("source"));
        }

        this.audit.submit();
    }

    render() {
        return (
            <ScreenWithHeader header={{
                title: this.props.navigation.getParam("title"),
                showBack: true,
            }}>
                <ScrollView style={{ padding: 10, backgroundColor: this.props.theme.colors.surface }}>
                    <DocViewer text={this.state.text} />
                </ScrollView>
            </ScreenWithHeader>
        );
    }
}

export const ShowMDScreen = withNavigation(withTheme(ShowMDScreenBase));