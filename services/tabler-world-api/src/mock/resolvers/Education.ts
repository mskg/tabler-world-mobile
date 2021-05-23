import faker from 'faker';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const Education = () => ({
    school: () => faker.company.companyName(),
    education: () => faker.commerce.department(),
});
