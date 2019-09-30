import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { FullScreenLoading } from '../../components/Loading';
import { ScreenWithHeader } from '../../components/Screen';
import { Categories, Logger } from '../../helper/Logger';
import { StartConversation, StartConversationVariables } from '../../model/graphql/StartConversation';
import { IConversationParams, showConversation } from '../../redux/actions/navigation';
import { StartConversationMutation } from './StartConversationMutation';

const logger = new Logger(Categories.Screens.Conversation);

type Props = {
    theme: Theme,
    showConversation: typeof showConversation;
};

// tslint:disable: max-func-body-length
class NewConversationScreenBase extends AuditedScreen<Props & NavigationInjectedProps<IConversationParams>> {
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
        });

        logger.debug('New conversation', result);
        this.props.showConversation(result.data!.startConversation.id, title);
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
export const NewConversationScreen = connect(
    null,
    { showConversation },
)(
    withTheme(
        withNavigation(NewConversationScreenBase),
    ),
);
