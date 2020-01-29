import React from 'react';
import { ScrollView, View } from 'react-native';
import { Divider, List, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import Assets from '../../../Assets';
import { ScreenWithHeader } from '../../../components/Screen';
import { I18N } from '../../../i18n/translation';
import { NextScreen } from './Action';
import { Routes } from './Routes';
import { getParameterValue } from '../../../helper/parameters/getParameterValue';
import { ParameterName } from '../../../model/graphql/globalTypes';
import { UrlParameters } from '../../../helper/parameters/Urls';

type Props = {
    theme: Theme,
};

type State = {
    urls: {
        title: string,
        url: string,
    }[],
};

class LegalScreenBase extends AuditedScreen<Props & NavigationInjectedProps, State> {
    state: State = {
        urls: [],
    };

    constructor(props) {
        super(props, AuditScreenName.Legal);
    }

    async componentWillMount() {
        super.componentDidMount();

        const urls: UrlParameters = await getParameterValue(ParameterName.urls);

        this.setState({
            urls: [
                {
                    title: I18N.Settings.Legal.docs.imprint,
                    url: urls.imprint[I18N.id] || urls.imprint.en,
                },
                {
                    title: I18N.Settings.Legal.docs.dataprotection,
                    url: urls.dataprotection[I18N.id] || urls.dataprotection.en,
                },
            ],
        });
    }

    render() {
        return (
            <ScreenWithHeader header={{ title: I18N.Settings.Legal.title, showBack: true }}>
                <ScrollView>
                    <List.Section>
                        <Divider />
                        {
                            this.state.urls.map((url) => (
                                <React.Fragment key={url.title}>
                                    <NextScreen
                                        theme={this.props.theme}
                                        text={url.title}
                                        onPress={
                                            () => this.props.navigation.navigate(Routes.External, {
                                                title: url.title,
                                                source: `${url.url}?refresh=${Date.now()}`,
                                            })
                                        }
                                    />
                                    <Divider />
                                </React.Fragment>
                            ))
                        }

                        <NextScreen
                            theme={this.props.theme}
                            text={I18N.Settings.Legal.thirdparty}
                            onPress={
                                () => this.props.navigation.navigate(Routes.MD, {
                                    title: I18N.Settings.Legal.thirdparty,
                                    source: Assets.files.license,
                                })
                            }
                        />
                        <Divider />
                        <NextScreen
                            theme={this.props.theme}
                            text={I18N.Settings.Legal.about}
                            onPress={
                                () => this.props.navigation.navigate(Routes.MD, {
                                    title: I18N.Settings.Legal.about,
                                    source: Assets.files.about,
                                })
                            }
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
