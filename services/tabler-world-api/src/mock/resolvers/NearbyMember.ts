import faker from 'faker';
import { randomLocation } from './randomLocation';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const NearbyMember = (_root: any, _args: any, context: any, _info: any) => {
    context.memberId = faker.random.number({
        min: 2, max: 100,
    });

    return {
        distance: (_root: any, _args: any, context: any, _info: any) => {
            let last = 0;
            if (context && context.lastDistance) {
                last = context.lastDistance;
            }

            const result = last + faker.random.number({
                min: 100,
                max: 10 * 1000,
            });

            context.lastDistance = result;
            return result;
        },

        lastseen: () => faker.date.recent().getTime(),
        state: () => 'Steady',

        location: randomLocation,
        locationName: () => ({
            name: () => faker.address.city(),
            country: () => faker.address.countryCode(),
        }),
    };
};
