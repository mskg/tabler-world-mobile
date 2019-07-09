import faker from 'faker';

export const Company = () => {

  const name = faker.company.companyName();

  return {
    name: () => name,
    email: () => faker.internet.email(undefined, undefined, faker.internet.domainName()),
    phone: () => faker.phone.phoneNumber(),
    // sector?
    function: () => faker.commerce.department(),
    begin_date: () => faker.date.past(5).toISOString(),
  }
};
