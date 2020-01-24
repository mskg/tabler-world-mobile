import faker from 'faker';
import _ from 'lodash';
import { Area } from './Area';
import { clubNames, memberNames } from './data';
import { Member } from './Member';
import { randomLocation } from './randomLocation';
import { AssistRoles, BoardRoles, PresidentRoles } from './Roles';

export const Club = (root: any, args: any, _context: any, _info: any) => {
    const clubId = (root || {}).club || (args || {}).id
        || faker.random.number({ min: 1, max: 31 });

    const club = clubNames[clubId - 1] || {};
    const members = _(memberNames)
        .filter((m) => m.club == clubId)
        .map((m: any) => Member({ member: m.id + 1 }, {}, null, null))
        .value();

    const presidents: any = _(members).take(5).map((m, i) => (
        {
            member: m,
            role: () => [...PresidentRoles, ...BoardRoles][i],
        }
    )).value();

    const assists: any = _(members)
        .takeRight(2)
        .map((m, i) => (
            {
                member: m,
                role: () => AssistRoles[i],
            }
        )).value();


    return {
        id: () => clubId,
        club: () => clubId,
        clubnumber: () => clubId,

        location: randomLocation,

        name: () => 'RT ' + clubId + ' ' + club.name,
        logo: () => club.pic,

        website: () => faker.internet.url(),
        instagram: () => faker.internet.url(),
        facebook: () => faker.internet.url(),
        twitter: () => faker.internet.url(),

        email: () => faker.internet.email(),
        phone: () => faker.phone.phoneNumber(),

        board: () => presidents,

        boardassistants: () => assists,
        area: () => Area({ area: club.area }, args, _context, _info),

        members: () => members,
    };
};

export const ClubInfo = () => ({
    charter_date: () => faker.date.past(25).toISOString(),
    first_meeting: () => 'Every first week',
    second_meeting: () => 'Every second week',

    national_godparent: () => faker.address.country(),
    international_godparent: () => faker.address.country(),
});

export const BankAccount = () => ({
    name: () => faker.finance.accountName(),
    owner: () => faker.name.findName(),
    iban: () => faker.finance.iban(),
    bic: () => faker.finance.bic(),
    currency: () => faker.finance.currencyCode(),
});
