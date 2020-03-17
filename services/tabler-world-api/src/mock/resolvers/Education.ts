import faker from 'faker';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const Education = () => ({
    school: () => faker.company.companyName(),
    eduction: () => faker.commerce.department(),
});
