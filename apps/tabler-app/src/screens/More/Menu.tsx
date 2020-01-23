import React from 'react';
import { Query } from 'react-apollo';
import { ScrollView, View } from 'react-native';
import { Divider, List, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { ScreenWithHeader } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { Features, isFeatureEnabled } from '../../model/Features';
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

    render() {
        return (
            <ScreenWithHeader header={{ title: I18N.Menu.title }}>
                <ScrollView>
                    <List.Section>
                        {isFeatureEnabled(Features.BackgroundLocation) && (
                            <>
                                <NavigationItem
                                    icon="md-navigate"
                                    theme={this.props.theme}
                                    text={I18N.NearbyMembers.title}
                                    onPress={() => this.props.navigation.navigate(Routes.Nearby)}
                                />

                                <Divider inset={true} />
                            </>
                        )}

                        {isFeatureEnabled(Features.Chat) && (
                            <>
                                <NavigationItem
                                    icon="md-chatboxes"
                                    theme={this.props.theme}
                                    text={I18N.Conversations.title}
                                    onPress={() => this.props.navigation.navigate(Routes.Conversations)}
                                />

                                <Divider inset={true} />
                            </>
                        )}
                    </List.Section>

                    {this.props.showExperiments && (
                        <List.Section>
                            <NavigationItem
                                icon="md-globe"
                                theme={this.props.theme}
                                text={I18N.World.title}
                                onPress={() => this.props.navigation.navigate(Routes.World)}
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
