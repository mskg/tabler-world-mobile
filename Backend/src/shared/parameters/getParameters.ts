import _ from "lodash";
import LRU from 'lru-cache';
import { isArray } from "util";
import { PARAMETER_TTL } from "../../graphql/cache/TTLs";
import { EXECUTING_OFFLINE } from "../isOffline";
import { xAWS } from "../xray/aws";
import { setupDebug } from "./debug";

const ssm = new xAWS.SSM();

export type Environments = "dev" | "test" | "prod";

type ParameterNames =
    | "tw-api"
    | "database"
    | "nearby"
    | "app"
    | "cachettl"
    ;

type MapType = {
    [key in ParameterNames]: string
};

const memoryCache = new LRU<string, string>({
    maxAge: PARAMETER_TTL,
});

export function mapName(name: string, env: string = 'dev'): string {
    return `/tabler-world/${env}/${name}`;
}

/**
 * Setup DEBUG mode
 */
if (EXECUTING_OFFLINE) {
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
    env: Environments = process.env.STAGE as Environments
): Promise<MapType> {
    // we need to reverse the encoding for the result
    const parameterNames = (isArray(name) ? name : [name]).reduce((p, c) => {
        p[mapName(c, env)] = c;
        return p;
    }, {} as { [key: string]: string });

    const req = {
        Names: _.keys(parameterNames),
        WithDecryption: true
    };

    //@ts-ignore
    const params: MapType = {};
    const missing = [];

    for (let p of req.Names) {
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
            for (let p of resp.Parameters) {
                if (p.Value) {
                    params[parameterNames[p.Name as string] as ParameterNames] = p.Value;
                    memoryCache.set(p.Name as string, p.Value);
                }
            }
        }
    }

    if (EXECUTING_OFFLINE) {
        console.log("[SSM] resolved parameters to", params);
    }

    // enforce that we have values
    _.values(parameterNames).forEach(
        (n) => {
            if (!params[n as ParameterNames]) {
                throw new Error("Configuration error, parameter " + n + " is not defined");
            }
        }
    )

    return params;
}
