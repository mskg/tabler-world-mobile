import faker from 'faker';
import _ from 'lodash';
import { SECTOR_MAPPING } from '../helper/Sectors';

export const Company = () => {

    const name = faker.company.companyName();

    return {
        name: () => name,
        email: () => faker.internet.email(undefined, undefined, faker.internet.domainName()),
        phone: () => faker.phone.phoneNumber(),
        sector: () => faker.random.arrayElement(_(SECTOR_MAPPING).keys().toArray().value()),
        function: () => faker.commerce.department(),
        begin_date: () => faker.date.past(5).toISOString(),
        end_date: () => faker.date.future(2).toISOString(),
    };
};
