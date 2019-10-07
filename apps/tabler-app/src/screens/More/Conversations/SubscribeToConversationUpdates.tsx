import React from 'react';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { Categories, Logger } from '../../../helper/Logger';
import { conversationUpdate } from '../../../model/graphql/conversationUpdate';
import { GetConversations } from '../../../model/graphql/GetConversations';
import { conversationUpdateSubscription } from './conversationUpdateSubscription';
import { GetConversationsQuery } from './GetConversationsQuery';

const logger = new Logger(Categories.UIComponents.Chat);

export class SubscribeToConversationUpdates extends React.PureComponent {
    subscription?: ZenObservable.Subscription;

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    componentDidMount() {
        logger.debug('Starting watching channel udpates');

        const client = cachedAolloClient();
        const observable = client
            .subscribe<conversationUpdate>({
                query: conversationUpdateSubscription,
            });

        this.subscription = observable.subscribe({
            next(next) {
                logger.log('Received', next);
                const data = next.data as conversationUpdate;

                const conversations = client.readQuery<GetConversations>({
                    query: GetConversationsQuery,
                });

                const nodes = conversations ? conversations.Conversations.nodes : [];
                client.writeQuery<GetConversations>({
                    query: GetConversationsQuery,
                    data: {
                        Conversations: {
                            __typename: 'ConversationIterator',
                            nodes: [
                                data.conversationUpdate,
                                ...nodes.filter((c) => c.id !== data.conversationUpdate.id),
                            ],
                        },
                    },
                });

                // client.writeQuery<ConversationStatus, ConversationStatusVariables>({
                //     query: GetConversationStatusQuery,
                //     variables: {
                //         id: data.conversationUpdate.id,
                //     },
                //     data: {
                //         Conversation: {
                //             ...data.conversationUpdate,
                //         },
                //     },
                // });
            },
            error(err) { logger.error(err); },
        });
    }

    render() {
        return null;
    }
}
