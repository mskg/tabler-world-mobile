import { MockList } from '@graphql-tools/mock';

export const ChatMessageIterator = () => {
    return {
        nodes: () => new MockList(5),
        nextToken: null,
    };
};
