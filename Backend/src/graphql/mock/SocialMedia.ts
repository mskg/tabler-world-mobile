import faker from 'faker';

export const SocialMedia = ({
  website: () => faker.random.boolean() ? faker.internet.url() : null,
  instagram: () => faker.random.boolean() ? faker.internet.url() : null,
  facebook: () => faker.random.boolean() ? faker.internet.url() : null,
  twitter: () => faker.random.boolean() ? faker.internet.url() : null,
});
