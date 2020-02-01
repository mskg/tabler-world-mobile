import faker from 'faker';
export const ChatMessage = () => {
    return {
        accepted: true,
        delivered: true,
        senderId: () => faker.random.boolean() ? 1 : 5,
    };
};
