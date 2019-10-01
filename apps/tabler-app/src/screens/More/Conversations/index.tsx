import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Query } from 'react-apollo';
import { StyleSheet } from 'react-native';
import { Appbar, Divider, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, ScrollView } from 'react-navigation';
import { connect } from 'react-redux';
import { FullScreenLoading } from '../../../components/Loading';
import { MemberListItem } from '../../../components/Member/MemberListItem';
import { ScreenWithHeader } from '../../../components/Screen';
import { I18N } from '../../../i18n/translation';
import { GetConversations } from '../../../model/graphql/GetConversations';
import { searchConversationPartner, showConversation } from '../../../redux/actions/navigation';
import { GetConversationsQuery } from './GetConversationsQuery';

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
};

type DispatchPros = {
    startConversation: typeof searchConversationPartner,
    showConversation: typeof showConversation,
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

// tslint:disable-next-line: export-name
export class ConversationsScreenBase extends React.Component<Props, State> {
    render() {
        return (
            <ScreenWithHeader
                header={{
                    showBack: true,
                    content: [
                        <Appbar.Content key="cnt" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={I18N.Conversations.title} />,
                        <Appbar.Action key="new" icon="add" onPress={() => this.props.startConversation()} />,
                    ],
                }}
            >
                <Query<GetConversations>
                    query={GetConversationsQuery}
                    fetchPolicy="cache-and-network"
                >
                    {({ data, error }) => {
                        if (error) return null;

                        if (data == null || data.Conversations == null) {
                            return (
                                <FullScreenLoading />
                            );
                        }

                        return (
                            <ScrollView contentContainerStyle={styles.content}>
                                {data.Conversations.nodes.map((l) => (
                                    <React.Fragment key={l.id}>
                                        <MemberListItem
                                            theme={this.props.theme}

                                            member={l.members[0]}
                                            right={({ size }) => {
                                                if (l.hasUnreadMessages) {
                                                    return (
                                                        <Ionicons
                                                            name="md-chatbubbles"
                                                            size={size}
                                                            style={{ marginRight: 30 }}
                                                            color={this.props.theme.colors.accent}
                                                        />
                                                    );
                                                }

                                                return null;
                                            }}
                                            onPress={() => this.props.showConversation(l.id, `${l.members[0].firstname} ${l.members[0].lastname}`)}
                                        />
                                        <Divider inset={true} />
                                    </React.Fragment>
                                ))}
                            </ScrollView>
                        );
                    }}
                </Query>
            </ScreenWithHeader>
        );
    }
}

export const ConversationsScreen = withTheme(connect(null, {
    showConversation,
    startConversation: searchConversationPartner,
})(ConversationsScreenBase));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        padding: 0,
    },
});
