import { MockList } from "graphql-tools";
import _ from "lodash";
import { Address } from "./Address";
import { Area } from "./Area";
import { BankAccount, Club, ClubInfo } from "./Club";
import { Company } from "./Company";
import { clubNames, memberNames } from "./data";
import { Education } from "./Education";
import { Member } from "./Member";
import { NearbyMember } from "./NearbyMember";
import { AssociationRole, Role, RoleRef, Roles } from "./Roles";
import { Association } from "./Structure";

import faker = require("faker");
faker.locale = "de";

export const mocks = {
  Date: () => faker.date.future(),

  Query: () => ({
    OwnTable: () => [],
    FavoriteMembers: () => [],

    // if we don't specify a mocklist
    // we receive errors that types are not defined for interfaces
    // one element is consumed by Me queries
    MembersOverview: () => new MockList(memberNames.length - 1),

    Associations: () => new MockList(1),

    Areas: () => _(clubNames)
      .map((a: any) => a.area)
      .uniq()
      .map((a: any) => Area({ area: a }, {}, {}, null))
      .value(),

    Clubs: () => _(clubNames)
      .map((c: any) => Club({ club: c.id + 1 }, {}, {}, null))
      .value(),

    nearbyMembers: () => new MockList(
      faker.random.number({min: 5, max: 20}),
    ),

    Roles,
    getParameters: () => [],

    MyRoles: () => [],
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
};
