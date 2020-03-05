import faker from 'faker';
import { MockList } from 'graphql-tools';
import { Area } from './Area';
import { Association } from './Association';
import { Club } from './Club';
import { clubNames, memberNames } from '../data';

export const Member = (root?: any, args?: any, context?: any, _info?: any) => {
    // this is a dirty hack to allow generating the list
    const memberId = (root || {}).member || (args || {}).id || (context || {}).memberId || 1;

    if (context) {
        context.memberId = memberId + 1; // we preserve it for iteration
    }

    const member = memberNames[memberId - 1] || memberNames[faker.random.number({ min: 10, max: 50 })];
    const club = clubNames[member.club - 1] || {};

    return {
        id: memberId,

        firstname: member.first,
        lastname: member.last,
        pic: member.pic,

        birthdate: () => faker.random.boolean() ? faker.date.past(30).toISOString() : null,
        rtemail: () => faker.internet.email(member.first, member.last),

        companies: () => faker.random.boolean() ? new MockList([0, 2]) : null,
        educations: () => faker.random.boolean() ? new MockList([0, 2]) : null,

        phonenumbers: () => faker.random.boolean() ? [{
            type: 'home',
            value: faker.phone.phoneNumber(),
        }] : null,

        emails: () => faker.random.boolean() ? [{
            type: 'private',
            value: faker.internet.email(member.first, member.last),
        }] : null,

        roles: () => faker.random.boolean()
            ? null
            : new MockList(faker.random.number({ min: 0, max: 3 })),

        association: () => Association(),
        club: () => Club({ club: member.club }, args, context, _info),
        area: () => Area({ area: club.area }, args, context, _info),

        partner: () => faker.random.boolean() ? faker.name.findName() : null,
    };
};
