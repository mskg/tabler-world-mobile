import { uniqBy } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Platform, StyleSheet } from 'react-native';
import { Appbar, Divider, Theme, withTheme } from 'react-native-paper';
import { FlatList, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { ChatDisabledBanner } from '../../../components/ChatDisabledBanner';
import { ITEM_HEIGHT } from '../../../components/Member/Dimensions';
import { EmptyComponent } from '../../../components/NoResults';
import { ScreenWithHeader } from '../../../components/Screen';
import { Categories, Logger } from '../../../helper/Logger';
import { I18N } from '../../../i18n/translation';
import { GetConversations, GetConversationsVariables, GetConversations_Conversations_nodes } from '../../../model/graphql/GetConversations';
import { IAppState } from '../../../model/IAppState';
import { GetConversationsQuery } from '../../../queries/Conversations/GetConversationsQuery';
import { searchConversationPartner, showConversation } from '../../../redux/actions/navigation';
import { ConversationListItem } from './ConversationListItem';

const logger = new Logger(Categories.UIComponents.Chat);

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    chatEnabled: boolean,
};

type DispatchPros = {
    startConversation: typeof searchConversationPartner,
    showConversation: typeof showConversation,
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

// tslint:disable-next-line: export-name
export class ConversationsScreenBase extends AuditedScreen<Props, State> {
    constructor(props) {
        super(props, AuditScreenName.Conversations);
    }

    _renderItem = ({ item: l }): React.ReactElement | null => {
        return (
            <>
                <ConversationListItem conversation={l} />
                <Divider inset={true} />
            </>
        );
    }

    _extractKey = (item: GetConversations_Conversations_nodes) => item.id;

    _getItemLayout = (_data, index) => {
        return {
            index,
            length: ITEM_HEIGHT + StyleSheet.hairlineWidth,
            offset: (ITEM_HEIGHT + StyleSheet.hairlineWidth) * index,
        };
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    showBack: true,
                    content: [
                        <Appbar.Content key="cnt" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={I18N.Conversations.title} />,
                        <Appbar.Action key="new" icon="add" disabled={!this.props.chatEnabled} onPress={() => this.props.startConversation()} />,
                    ],
                }}
            >
                <ChatDisabledBanner />

                <Query<GetConversations, GetConversationsVariables>
                    query={GetConversationsQuery}
                    fetchPolicy="cache-and-network"
                >
                    {({ data, error, loading, refetch, fetchMore }) => {
                        if (error) return null;

                        return (
                            <FlatList
                                scrollEventThrottle={16}
                                removeClippedSubviews={Platform.OS !== 'ios'}
                                contentContainerStyle={styles.container}

                                keyExtractor={this._extractKey}
                                renderItem={this._renderItem}
                                getItemLayout={this._getItemLayout}

                                ListEmptyComponent={loading ? undefined : <EmptyComponent title={I18N.Members.noresults} />}

                                data={data && data.Conversations ? data.Conversations.nodes : []}

                                refreshing={loading}
                                onRefresh={() => refetch()}

                                onEndReached={() => {
                                    if (!data) { return; }

                                    fetchMore({
                                        variables: {
                                            token: data.Conversations.nextToken,
                                        },

                                        updateQuery: (previousResult, { fetchMoreResult }) => {
                                            // Don't do anything if there weren't any new items
                                            if (!fetchMoreResult || fetchMoreResult.Conversations.nodes.length === 0) {

                                                logger.log('no new data');
                                                return previousResult;
                                            }

                                            logger.log('appending', fetchMoreResult.Conversations.nodes.length);

                                            return {
                                                // There are bugs that the calls are excuted twice
                                                // a lot of notes on the internet
                                                Conversations: {
                                                    ...fetchMoreResult.Conversations,
                                                    nodes: uniqBy(
                                                        [...previousResult.Conversations.nodes, ...fetchMoreResult.Conversations.nodes],
                                                        (f) => f.id,
                                                    ),
                                                },
                                            };
                                        },
                                    });
                                }}
                                onEndReachedThreshold={0.5}
                            />
                        );
                    }}
                </Query>
            </ScreenWithHeader>
        );
    }
}

export const ConversationsScreen = withTheme(connect(
    (state: IAppState) => ({ chatEnabled: state.settings.notificationsOneToOneChat || state.settings.notificationsOneToOneChat == null }),
    {
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
