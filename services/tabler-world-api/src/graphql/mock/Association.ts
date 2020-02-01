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
        logo: () => 'https://loremflickr.com/g/800/240/city',
        flag: () => {
            switch (country) {
                case 'fr':
                    return 'https://s3-eu-west-1.amazonaws.com/assets.app.roundtable.world/flags/fr.png';
                case 'us':
                    return 'https://s3-eu-west-1.amazonaws.com/assets.app.roundtable.world/flags/us.png';
                default:
                    return 'https://s3-eu-west-1.amazonaws.com/assets.app.roundtable.world/flags/de.png';
            }
        },

        board: () => new MockList(5),
        boardassistants: () => new MockList(3),
    };
};
