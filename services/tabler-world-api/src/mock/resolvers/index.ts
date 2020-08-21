import { MockList } from '@graphql-tools/mock';
import _ from 'lodash';
import { Address } from './Address';
import { Area } from './Area';
import { Association } from './Association';
import { ChatMessage } from './ChatMessage';
import { ChatMessageIterator } from './ChatMessageIterator';
import { ChatMessagePayload } from './ChatMessagePayload';
import { BankAccount, Club, ClubInfo } from './Club';
import { Company } from './Company';
import { Conversation } from './Conversation';
import { clubNames, memberNames } from '../data';
import { Education } from './Education';
import { Member } from './Member';
import { NearbyMember } from './NearbyMember';
import { AssociationRole, Role, RoleRef, Roles } from './Roles';

import faker = require('faker');
faker.locale = 'de';

// tslint:disable: object-shorthand-properties-first
// tslint:disable: export-name
export const rootResolver = {
    Date: () => faker.date.future(),

    Query: () => ({
        Me: () => Member(null, null, null, null), // must always be 1

        OwnTable: () => [],
        FavoriteMembers: () => [],

        // if we don't specify a mocklist
        // we receive errors that types are not defined for interfaces
        // one element is consumed by Me queries
        MembersOverview: () => new MockList(memberNames.length - 1),

        // SearchDirectory: () => new MockList(20),

        Associations: () => new MockList(20),

        Areas: () => _(clubNames)
            .map((a: any) => a.area)
            .uniq()
            .map((a: any) => Area({ area: a }, {}, {}, null))
            .value(),

        Clubs: () => _(clubNames)
            .map((c: any) => Club({ club: c.id + 1 }, {}, {}, null))
            .value(),

        nearbyMembers: () => new MockList(
            faker.random.number({ min: 5, max: 20 }),
        ),

        Roles,
        getParameters: () => [],

        MyRoles: () => [],

        Conversations: () => ({
            nextToken: null,
            nodes: () => new MockList(5),
        }),
    }),

    Member,
    Address,
    Club,
    ClubInfo,
    BankAccount,
    Company,
    Education,
    Role,
    AssociationRole,
    Association,
    Area,
    RoleRef,
    NearbyMember,
    Conversation,
    ChatMessage,
    ChatMessagePayload,
    ChatMessageIterator,
};
