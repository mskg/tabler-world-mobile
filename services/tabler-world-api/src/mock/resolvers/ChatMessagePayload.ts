import faker from 'faker';

export const ChatMessagePayload = () => {
    return {
        text: () => faker.random.words(),
        image: () =>
            faker.datatype.boolean()
                ? 'https://loremflickr.com/g/200/200/cat' + '?' + faker.datatype.number()
                : null,
    };
};


