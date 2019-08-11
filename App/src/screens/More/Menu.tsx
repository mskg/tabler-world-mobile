import React from 'react';
import { ScrollView, View } from "react-native";
import { Divider, List, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { ScreenWithHeader } from '../../components/Screen';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { Features, isFeatureEnabled } from '../../model/Features';
import { IAppState } from '../../model/IAppState';
import { Routes } from './Routes';
import { NavigationItem } from './Settings/Action';

const logger = new Logger(Categories.Screens.Menu);

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    showExperiments?: boolean,
};

type DispatchPros = {
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class MenuScreenBase extends AuditedScreen<Props, State> {
    constructor(props) {
        super(props, AuditScreenName.Menu);
    }

    render() {
        return (
            <ScreenWithHeader header={{ title: I18N.Menu.title }}>
                <ScrollView>
                    <List.Section>
                        {isFeatureEnabled(Features.BackgroundLocation) &&
                            <>
                                <NavigationItem icon="md-navigate" theme={this.props.theme} text={I18N.NearbyMembers.title} onPress={
                                    () => this.props.navigation.navigate(Routes.Nearby)} />

                                <Divider inset={true} />
                            </>
                        }

                        {this.props.showExperiments &&
                            <>
                                <NavigationItem icon="md-globe" theme={this.props.theme} text={I18N.World.title} onPress={
                                    () => this.props.navigation.navigate(Routes.World)} />

                                <Divider inset={true} />
                            </>
                        }
                    </List.Section>

                    <List.Section>
                        <NavigationItem icon="md-microphone" theme={this.props.theme} text={I18N.Feedback.title} onPress={
                            () => this.props.navigation.navigate(Routes.Feedback)} />

                        <Divider inset={true} />
                    </List.Section>

                    <List.Section>
                        <NavigationItem icon="md-settings" theme={this.props.theme} text={I18N.Settings.title} onPress={
                            () => this.props.navigation.navigate(Routes.Settings)} />

                        <Divider inset={true} />
                    </List.Section>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </ScreenWithHeader >
        );
    }
}

export const MenuScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        showExperiments: state.settings.experiments
    }),
    {
    })(withNavigation(withTheme(MenuScreenBase)));
