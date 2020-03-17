import { MockList } from 'graphql-tools';

export const ChatMessageIterator = () => {
    return {
        nodes: () => new MockList(5),
        nextToken: null,
    };
};
