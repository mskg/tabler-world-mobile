import React from 'react';
import { ScrollView, View } from "react-native";
import { Divider, List, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import Assets from '../../../Assets';
import { ScreenWithHeader } from '../../../components/Screen';
import { I18N } from '../../../i18n/translation';
import { NextScreen } from './Action';
import { Routes } from './Routes';

type Props = {
    theme: Theme,
};

class LegalScreenBase extends AuditedScreen<Props & NavigationInjectedProps> {
    constructor(props) {
        super(props, AuditScreenName.Legal);
    }

    render() {
        return (
            <ScreenWithHeader header={{ title: I18N.Settings.Legal.title, showBack: true }}>
                <ScrollView>
                    <List.Section>
                        <Divider />
                        {
                            I18N.Settings.Legal.docs.map(d => (
                                <React.Fragment key={d.title}>
                                    <NextScreen theme={this.props.theme} text={d.title} onPress={
                                        () => this.props.navigation.navigate(Routes.External, {
                                            title: d.title,
                                            source: d.url + "?refresh=" + Date.now,
                                        })}
                                    />
                                    <Divider />
                                </React.Fragment>
                            ))
                        }

                        <NextScreen theme={this.props.theme} text={I18N.Settings.Legal.thirdparty} onPress={
                            () => this.props.navigation.navigate(Routes.MD, {
                                title: I18N.Settings.Legal.thirdparty,
                                source: Assets.files.license,
                            })}
                        />
                        <Divider />
                        <NextScreen theme={this.props.theme} text={I18N.Settings.Legal.about} onPress={
                            () => this.props.navigation.navigate(Routes.MD, {
                                title: I18N.Settings.Legal.about,
                                source: Assets.files.about,
                            })}
                        />
                        <Divider />
                    </List.Section>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </ScreenWithHeader>
        );
    }
}

export const LegalScreen = withTheme(withNavigation(LegalScreenBase));
