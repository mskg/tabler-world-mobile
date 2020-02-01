import React from 'react';
import { Query } from 'react-apollo';
import { Image, ScrollView, View } from 'react-native';
import { Divider, List, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import Assets from '../../Assets';
import { ScreenWithHeader } from '../../components/Screen';
import { showShakeErrorReport } from '../../components/ShakeErrorReport';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { GetMyRoles } from '../../model/graphql/GetMyRoles';
import { UserRole } from '../../model/graphql/globalTypes';
import { IAppState } from '../../model/IAppState';
import { GetMyRolesQuery } from '../../queries/Admin/GetMyRolesQuery';
import { Routes } from './Routes';
import { NavigationItem } from './Settings/Action';

// const logger = new Logger(Categories.Screens.Menu);

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    showExperiments?: boolean,
    fetchPolicy: any,
};

type DispatchPros = {
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class MenuScreenBase extends AuditedScreen<Props, State> {
    constructor(props) {
        super(props, AuditScreenName.Menu);
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        return (
            <ScreenWithHeader header={{ title: I18N.Menu.title }}>
                <ScrollView>
                    <List.Section>
                        <NavigationItem
                            icon={<Image source={Assets.images.icon_tw} style={{ marginTop: 2, height: 32, width: 32 }} />}
                            theme={this.props.theme}
                            text={I18N.World.title}
                            onPress={() => this.props.navigation.navigate(Routes.World)}
                        />

                        <Divider inset={true} />
                    </List.Section>

                    {this.props.showExperiments && (
                        <List.Section>
                            <NavigationItem
                                icon="md-paper"
                                theme={this.props.theme}
                                text={I18N.News.title}
                                onPress={() => this.props.navigation.navigate(Routes.News)}
                            />

                            <Divider inset={true} />

                            <NavigationItem
                                icon="md-image"
                                theme={this.props.theme}
                                text={I18N.Albums.title}
                                onPress={() => this.props.navigation.navigate(Routes.Albums)}
                            />

                            <Divider inset={true} />
                        </List.Section>
                    )}

                    <List.Section>
                        <NavigationItem
                            icon="md-microphone"
                            theme={this.props.theme}
                            text={I18N.Feedback.title}
                            onPress={() => this.props.navigation.navigate(Routes.Feedback)}
                        />

                        <Divider inset={true} />

                        <NavigationItem
                            icon="md-warning"
                            theme={this.props.theme}
                            text={I18N.Support.title}
                            onPress={() => showShakeErrorReport()}
                        />

                        <Divider inset={true} />
                    </List.Section>

                    <List.Section>
                        <Query<GetMyRoles>
                            query={GetMyRolesQuery}
                            fetchPolicy={this.props.fetchPolicy}
                        >
                            {({ data }) => {
                                if (data && data.MyRoles && data.MyRoles.find((i) => i === UserRole.jobs)) {
                                    return (
                                        <>
                                            <NavigationItem
                                                icon="md-alarm"
                                                theme={this.props.theme}
                                                text={'Job History'}
                                                onPress={() => this.props.navigation.navigate(Routes.JobHistory)}
                                            />

                                            <Divider inset={true} />
                                        </>
                                    );
                                }

                                return null;
                            }}
                        </Query>

                        <NavigationItem
                            icon="md-settings"
                            theme={this.props.theme}
                            text={I18N.Settings.title}
                            onPress={() => this.props.navigation.navigate(Routes.Settings)}
                        />

                        <Divider inset={true} />
                    </List.Section>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </ScreenWithHeader >
        );
    }
}

// tslint:disable-next-line: export-name
export const MenuScreen = connect(
    (state: IAppState) => ({
        showExperiments: state.settings.experiments,
    }),
    {},
)(
    withCacheInvalidation(
        'userroles',
        withNavigation(
            withTheme(MenuScreenBase))));
