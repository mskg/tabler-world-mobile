import faker from 'faker';

export const Education = () => ({
  school: () => faker.company.companyName(),
  eduction: () => faker.commerce.department(),
});
