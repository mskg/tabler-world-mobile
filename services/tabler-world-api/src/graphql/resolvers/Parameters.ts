import { Family } from '@mskg/tabler-world-auth-client';
import { getParameters, Param_Nearby } from '@mskg/tabler-world-config';
import { IApolloContext } from '../types/IApolloContext';

type ParameterArgs = {
    info?: {
        version: string,
        os: 'ios' | 'android',
    },
};

type Result = { name: string, value: { [key: string]: any } };
function findMerge(any: Result[], name: string, value: { [key: string]: any }) {
    let found = false;

    // tslint:disable: prefer-for-of
    // tslint:disable: no-increment-decrement
    for (let i = 0; i < any.length; ++i) {
        if (any[i].name === name) {
            any[i].value = {
                ...any[i].value,
                ...value,
            };

            found = true;
            break;
        }
    }

    if (!found) {
        any.push({
            name,
            value,
        });
    }
}

// tslint:disable: export-name
// tslint:disable: variable-name
export const ParametersResolver = {
    Query: {
        getParameters: async (_root: any, args: ParameterArgs, context: IApolloContext) => {
            try {
                const appParam = await getParameters(
                    [
                        'app',
                        'app/ios',
                        'app/android',
                        'nearby',
                    ],
                    false,
                );

                const app = JSON.parse(appParam.app || '{}') as any;
                const ios = JSON.parse(appParam['app/ios'] || '{}') as any;
                const android = JSON.parse(appParam['app/android'] || '{}') as any;

                const overrides: any = Object.keys(app).map((k) => ({
                    name: k,
                    value: {
                        ...app[k],
                        ...((args.info && args.info.os === 'android'
                            ? android[k]
                            : ios[k]
                        ) || {}),
                    },
                }));

                const nearby = JSON.parse(appParam.nearby || '{}') as Param_Nearby;
                if (nearby.administrativePreferences) {
                    findMerge(overrides, 'geocoding', {
                        bigData: nearby.administrativePreferences,
                    });
                }

                // this always depends on the logged-in user
                if (context.principal.family === Family.RTI) {
                    findMerge(overrides, 'urls', {
                        world: 'https://rti.roundtable.world/#lang#/',
                        profile: 'https://rti.roundtable.world/#lang#/members/#id#/',
                        world_whitelist: ['*.roundtable.world', '*.ladiescircle.world', '*.41er.world'],
                    });
                } else if (context.principal.family === Family.LCI) {
                    findMerge(overrides, 'urls', {
                        world: 'https://lci.ladiescircle.world/#lang#/',
                        profile: 'https://lci.ladiescircle.world/#lang#/members/#id#/',
                        world_whitelist: ['*.roundtable.world', '*.ladiescircle.world', '*.41er.world'],
                    });
                } else if (context.principal.family === Family.C41) {
                    findMerge(overrides, 'urls', {
                        world: 'https://41int.41er.world/#lang#/',
                        profile: 'https://41int.41er.world/#lang#/members/#id#/',
                        world_whitelist: ['*.roundtable.world', '*.ladiescircle.world', '*.41er.world'],
                    });
                }

                return overrides;
            } catch (e) {
                context.logger.error('Failed to getParameters', e);
                return null;
            }
        },
    },
};
