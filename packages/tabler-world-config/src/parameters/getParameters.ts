import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';
import { keys, values } from 'lodash';
import LRU from 'lru-cache';
import { isArray } from 'util';
import { Environments } from './Environments';
import { mapName } from './mapName';
import { setupDebug } from './setupDebug';
import { PARAMETER_TTL } from './ttl';

const ssm = new xAWS.SSM();

type ParameterNames =
    | 'tw-api'
    | 'database'
    | 'nearby'
    | 'app'
    | 'app/ios'
    | 'app/android'
    | 'cachettl'
    ;

type MapType = {
    [key in ParameterNames]: string
};

const memoryCache = new LRU<string, string>({
    maxAge: PARAMETER_TTL,
});

/**
 * Setup DEBUG mode
 */
if (EXECUTING_OFFLINE) {
    console.log('Setting up debug keys');
    setupDebug(memoryCache);
}

/**
 * Get a configuration variables from SSM.
 * If a parameter cannot be resolved, the method failes.
 *
 * @param name Array of parameter names
 * @param env Defaults to process.env.STAGE
 * @returns HashMap with {Name: Value}
 */
export async function getParameters(
    name: ParameterNames[] | ParameterNames,
    failOnMissingValues = true,
    env: Environments = process.env.STAGE as Environments,
): Promise<MapType> {
    // we need to reverse the encoding for the result
    const parameterNames = (isArray(name) ? name : [name]).reduce((p, c) => {
        p[mapName(c, env)] = c;
        return p;
    }, {} as { [key: string]: string });

    const req = {
        Names: keys(parameterNames),
        WithDecryption: true,
    };

    // @ts-ignore
    const params: MapType = {};
    const missing = [];

    for (const p of req.Names) {
        const cached = memoryCache.get(p);
        if (cached) {
            params[parameterNames[p] as ParameterNames] = cached;
        } else {
            missing.push(p);
        }
    }

    if (missing.length > 0) {
        const resp = await ssm.getParameters({
            ...req,
            Names: missing,
        }).promise();

        if (resp.Parameters) {
            for (const p of resp.Parameters) {
                if (p.Value) {
                    params[parameterNames[p.Name as string] as ParameterNames] = p.Value;
                    memoryCache.set(p.Name as string, p.Value);
                }
            }
        }
    }

    if (EXECUTING_OFFLINE) {
        console.log('[SSM] resolved parameters to', params);
    }

    if (failOnMissingValues) {
        // enforce that we have values
        values(parameterNames).forEach(
            (n) => {
                if (!params[n as ParameterNames]) {
                    throw new Error('Configuration error, parameter ' + n + ' is not defined');
                }
            },
        );
    }

    return params;
}
