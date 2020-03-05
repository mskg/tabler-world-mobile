import { DataProxy } from 'apollo-cache';
import { Conversation, ConversationVariables } from '../../model/graphql/Conversation';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { logger } from './logger';
import { mergeMessages } from './mergeMessages';

export function addMessageToCache(
    cache: DataProxy, { data: { sendMessage } }: any,
    conversation: string,
) {
    logger.debug('addMessageToCache', sendMessage);

    // we always add to the end
    const variables = {
        token: undefined,
        id: conversation,
    };

    // Read the data from our cache for this query.
    const data = cache.readQuery<Conversation, ConversationVariables>({
        query: GetConversationQuery,
        variables,
    });

    if (data == null) {
        logger.debug('data is null?');
        return;
    }

    const newArray = mergeMessages(
        [sendMessage],
        // we don't add the message if it is already there
        data.Conversation!.messages.nodes,
        true,
    );

    // logger.debug('data', newArray);

    if (newArray !== data.Conversation!.messages.nodes) {
        logger.debug('Writing result');

        // cache has change detection, we only modify what we need
        data.Conversation!.messages.nodes = newArray;

        cache.writeQuery({
            query: GetConversationQuery,
            data,
            variables,
        });
    }
    // else {
    //     logger.log('Skipping update');
    // }
}
