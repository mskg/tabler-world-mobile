import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, StackActions, withNavigation, NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { FullScreenLoading } from '../../components/Loading';
import { ScreenWithHeader } from '../../components/Screen';
import { Categories, Logger } from '../../helper/Logger';
import { StartConversation, StartConversationVariables } from '../../model/graphql/StartConversation';
import { HomeRoutes } from '../../navigation/HomeRoutes';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { StartConversationMutation } from '../../queries/Conversations/StartConversationMutation';
import { IConversationParams, showConversation } from '../../redux/actions/navigation';
import { logger } from './logger';

type Props = {
    theme: Theme,
    showConversation: typeof showConversation;
};

// tslint:disable: max-func-body-length
class StartConversationScreenBase extends AuditedScreen<Props & NavigationInjectedProps<IConversationParams>> {
    ref: any;

    constructor(props) {
        super(props, AuditScreenName.NewConversation);
    }

    async componentDidMount() {
        logger.debug('New conversation', this.props.navigation.state.params);

        const { member, title } = this.props.navigation.state.params as IConversationParams;

        const client = cachedAolloClient();
        const result = await client.mutate<StartConversation, StartConversationVariables>({
            mutation: StartConversationMutation,
            // refetchQueries: [  ]
            variables: {
                member: member as number,
            },

            refetchQueries: [{
                query: GetConversationsQuery,
            }],
        });

        logger.debug('New conversation', result);

        try {
            this.props.navigation.dispatch(
                StackActions.replace({
                    routeName: HomeRoutes.Conversation,

                    // key: HomeRoutes.SearchConversationPartner,
                    newKey: `${HomeRoutes.Conversation}:${result.data!.startConversation.id}`,

                    params: {
                        title,
                        id: result.data!.startConversation.id,
                    } as IConversationParams,
                }),
            );
        } catch (e) {
            this.props.navigation.dispatch(
                NavigationActions.navigate({
                    routeName: HomeRoutes.Conversation,

                    // key: HomeRoutes.SearchConversationPartner,
                    key: `${HomeRoutes.Conversation}:${result.data!.startConversation.id}`,

                    params: {
                        title,
                        id: result.data!.startConversation.id,
                    } as IConversationParams,
                }),
            );
        }

        this.audit.submit();
    }

    render() {
        const { title } = this.props.navigation.state.params as IConversationParams;

        return (
            <ScreenWithHeader
                header={{
                    title,
                    showBack: true,
                }}
            >
                <FullScreenLoading />
            </ScreenWithHeader >
        );
    }
}

// tslint:disable-next-line: export-name
export const StartConversationScreen = connect(
    null,
    { showConversation },
)(
    withTheme(
        withNavigation(StartConversationScreenBase),
    ),
);
