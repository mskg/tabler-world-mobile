import { MockList } from '@graphql-tools/mock';
import { associationNames } from '../data';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const Association = (root?: any, args?: any, context?: any, _info?: any) => {
    // this is a dirty hack to allow generating the list
    const assocId = (root || {}).assoc || (args || {}).id || (context || {}).assoc || 1;

    if (context) {
        context.assoc = assocId + 1;
    }

    const assoc = associationNames[assocId - 1] || {};

    return {
        id: () => assocId,
        name: () => assoc.name,
        logo: () => 'https://loremflickr.com/g/800/240/city',
        flag: () => assoc.flag,

        board: () => new MockList(5),
        boardassistants: () => new MockList(3),
    };
};
