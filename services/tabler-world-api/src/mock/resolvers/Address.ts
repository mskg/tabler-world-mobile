import faker from 'faker';
import { randomLocation } from './randomLocation';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const Address = () => ({
    street1: () => faker.address.streetAddress(false),
    street2: () => faker.address.secondaryAddress(),
    postal_code: () => faker.address.zipCode(),
    city: () => faker.address.city(),
    country: () => faker.address.countryCode(),
    location: randomLocation,
});

