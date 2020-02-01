import { MockList } from 'graphql-tools';

export const ChatMessageIterator = () => {
    return {
        nodes: () => new MockList(15),
        nextToken: null,
    };
};
