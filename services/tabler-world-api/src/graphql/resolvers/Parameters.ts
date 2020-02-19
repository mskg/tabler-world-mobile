import { getParameters, Param_Nearby } from '@mskg/tabler-world-config';
import { IApolloContext } from '../types/IApolloContext';

type ParameterArgs = {
    info?: {
        version: string,
        os: 'ios' | 'android',
    },
};

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
                const nearby = JSON.parse(appParam.nearby || '{}') as Param_Nearby;

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

                if (nearby.administrativePreferences) {
                    overrides.geocoding = {
                        bigData: nearby.administrativePreferences,
                    };
                }

                return overrides;
            } catch (e) {
                context.logger.error('Failed to getParameters', e);
                return null;
            }
        },
    },
};
