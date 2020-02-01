import faker from 'faker';

export const ChatMessagePayload = () => {
    return {
        text: () => faker.random.words(),
        image: () =>
            faker.random.boolean()
                ? 'https://loremflickr.com/g/200/200/cat' + '?' + faker.random.number()
                : null,
    };
};


