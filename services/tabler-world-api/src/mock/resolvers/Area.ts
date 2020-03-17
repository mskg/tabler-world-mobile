import faker from 'faker';
import { MockList } from 'graphql-tools';
import _ from 'lodash';
import { Club } from './Club';
import { clubNames } from '../data';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const Area = (root: any, args: any, _context: any, _info: any) => {
    const area = root.area || args.id || faker.random.number({ min: 1, max: 6 });
    // console.log("Area", root);

    return {
        id: () => 'de_' + area,
        area: () => area,
        name: () => 'Distrikt ' + area,
        shortname: () => 'D' + area,

        board: () => new MockList(3),

        clubs: () => _(clubNames)
            // zero based indexes
            .filter(c => c.area == area)
            .map((c) => Club({ club: c.id + 1 }, args, _context, _info))
            .value(),
    };
};
