import faker from 'faker';
import { MockList } from 'graphql-tools';

// tslint:disable-next-line: export-name
export const Association = () => ({
    id: () => 'de',
    name: () => 'RT Deutschland',
    logo: () => faker.random.image(),

    board: () => new MockList(5),
    boardassistants: () => new MockList(3),
});
