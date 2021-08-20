import { MockList } from '@graphql-tools/mock';
import faker from 'faker';
import { clubNames, memberNames } from '../data';
import { Area } from './Area';
import { Association } from './Association';
import { Club } from './Club';
import { Family } from './Family';

const pictures: string[] = (faker as any)?.definitions?.internet?.avatar_uri || [];

export const Member = (root?: any, args?: any, context?: any, _info?: any) => {
    // this is a dirty hack to allow generating the list
    const memberId = (root || {}).member || (args || {}).id || (context || {}).memberId || 1;

    if (context) {
        context.memberId = memberId + 1; // we preserve it for iteration
    }

    const member = memberNames[memberId - 1] || memberNames[faker.datatype.number({ min: 10, max: 50 })];
    const club = clubNames[member.club - 1] || {};

    return {
        id: memberId,

        firstname: member.first,
        lastname: member.last,
        pic: member.pic && pictures.length > memberId
            ? `https://cdn.fakercloud.com/avatars/${(pictures[memberId]}`
            : undefined,

        birthdate: () => faker.datatype.boolean() ? faker.date.past(30).toISOString() : null,
        rtemail: () => faker.internet.email(member.first, member.last),

        companies: () => faker.datatype.boolean() ? new MockList([0, 2]) : null,
        educations: () => faker.datatype.boolean() ? new MockList([0, 2]) : null,

        phonenumbers: () => faker.datatype.boolean() ? [{
            type: 'home',
            value: faker.phone.phoneNumber(),
        }] : null,

        emails: () => faker.datatype.boolean() ? [{
            type: 'private',
            value: faker.internet.email(member.first, member.last),
        }] : null,

        roles: () => faker.datatype.boolean()
            ? null
            : new MockList(faker.datatype.number({ min: 0, max: 3 })),

        family: () => Family(),
        association: () => Association(),
        club: () => Club({ club: member.club }, args, context, _info),
        area: () => Area({ area: club.area }, args, context, _info),

        partner: () => faker.datatype.boolean() ? faker.name.findName() : null,
    };
};
