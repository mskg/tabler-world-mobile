import { MockList } from '@graphql-tools/mock';
import { familyNames } from '../data';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const Family = (root?: any, args?: any, context?: any, _info?: any) => {
    // this is a dirty hack to allow generating the list
    const familyId = (root || {}).family || (args || {}).id || (context || {}).family || 1;

    if (context && familyId === parseInt(familyId, 10)) {
        context.family = familyId + 1;

        if (context.family > familyNames.length) {
            context.family = 1;
        }
    }

    let family = familyNames[0];

    if (familyId === parseInt(familyId, 10)) {
        family = familyNames[familyId - 1] || {};
    } else {
        // tslint:disable-next-line: triple-equals
        family = familyNames.find((e: any) => e.id == familyId) || {};
    }

    return {
        id: () => family.id,
        name: () => family.name,
        shortname: () => family.shortname,

        logo: () => 'https://loremflickr.com/g/800/240/city',
        icon: () => 'https://loremflickr.com/g/800/240/city',

        board: () => new MockList(5),
        boardassistants: () => new MockList(5),
        regionalboard: () => new MockList(6),

        associations: () => new MockList(15),
    };
};
