import faker from 'faker';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const SocialMedia = ({
    website: () => faker.datatype.boolean() ? faker.internet.url() : null,
    instagram: () => faker.datatype.boolean() ? faker.internet.url() : null,
    facebook: () => faker.datatype.boolean() ? faker.internet.url() : null,
    twitter: () => faker.datatype.boolean() ? faker.internet.url() : null,
});
