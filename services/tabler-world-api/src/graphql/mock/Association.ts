import faker from 'faker';
import { MockList } from 'graphql-tools';

// tslint:disable-next-line: variable-name
export const Association = () => {

    const country = faker.random.arrayElement(['de', 'us', 'fr']);

    return {
        id: () => country,
        name: () => {
            switch (country) {
                case 'fr':
                    return 'RT France';
                case 'us':
                    return 'RT USA';
                default:
                    return 'RT Deutschland';
            }
        },
        logo: () => faker.random.image(),

        board: () => new MockList(5),
        boardassistants: () => new MockList(3),
    };
};
