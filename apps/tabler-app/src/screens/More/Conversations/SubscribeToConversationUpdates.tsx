import React from 'react';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { Categories, Logger } from '../../../helper/Logger';
import { conversationUpdate } from '../../../model/graphql/conversationUpdate';
import { GetConversations } from '../../../model/graphql/GetConversations';
import { conversationUpdateSubscription } from '../../../queries/Conversations/conversationUpdateSubscription';
import { GetConversationsQuery } from '../../../queries/Conversations/GetConversationsQuery';

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
            async next(next) {
                logger.log('Received', next);
                const data = next.data as conversationUpdate;

                let conversations = client.readQuery<GetConversations>({
                    query: GetConversationsQuery,
                });

                if (conversations == null) {
                    const temp = await client.query<GetConversations>({
                        query: GetConversationsQuery,
                    });

                    conversations = temp.data;
                }

                const nodes = conversations ? conversations.Conversations.nodes : [];
                client.writeQuery<GetConversations>({
                    query: GetConversationsQuery,
                    data: {
                        Conversations: {
                            ...conversations.Conversations,
                            nodes: [
                                data.conversationUpdate,
                                ...nodes.filter((c) => c.id !== data.conversationUpdate.id),
                            ],
                        },
                    },
                });
            },

            error(err) { logger.error(err); },
        });
    }

    render() {
        return null;
    }
}
