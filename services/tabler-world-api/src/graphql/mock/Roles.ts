import faker from 'faker';
import _ from 'lodash';

export const PresidentRoles = [
    'President',
    'Vice-President',
    'Past-President',
];

export const BoardRoles = [
    'I.R.O.',
    'Treasurer',
];

export const AssistRoles = [
    'Webmaster',
    'P.R.O',
];

const AssistRolesRTD = [
    'C.S.O',
    'IT Admin',
    'Editor',
    'Corporate Design Office',
    'Shopkeeper',
];

export const Roles = () => _([...PresidentRoles, ...BoardRoles, ...AssistRoles, ...AssistRolesRTD]).sort().value();

export const AssociationRole = () => ({
    role: () => faker.random.arrayElement(PresidentRoles),
});

export const RoleRef = () => {
    return faker.random.arrayElement([{
      id: () => 'de_' + faker.random.number({ min: 1, max: 300 }),
      name: () => 'RT' + faker.random.number({ min: 1, max: 300 }),
      type: () => 'club',
  },
      {
          id: () => 'de_' + faker.random.number({ min: 1, max: 16 }),
          name: () => 'Distrikt ' + faker.random.number({ min: 1, max: 16 }),
          type: () => 'area',
      },
      {
          id: () => 'de',
          name: () => 'RT Germany',
          type: () => 'assoc',
      }]);
};

export const Role = () => {
    return faker.random.boolean()
    ? {
        name: () => faker.random.arrayElement([...PresidentRoles, ...BoardRoles]),
        level: () => '',
        group: () => faker.random.arrayElement([
          'Board',
      ]),
    }
    : {
        name: () => faker.random.arrayElement(AssistRoles),
        level: () => '',
        group: () => faker.random.arrayElement([
          'Board Assistants',
      ]),
    };
};
