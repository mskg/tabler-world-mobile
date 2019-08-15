import _ from "lodash";
import LRU from 'lru-cache';
import { isArray } from "util";
import { EXECUTING_OFFLINE } from "../isOffline";
import { xAWS } from "../xray/aws";
import { Param_Api, Param_Database, Param_Nearby } from "./types";

const ssm = new xAWS.SSM();

export type Environments = "dev" | "test" | "prod";

type ParameterNames =
    | "tw-api"
    | "database"
    | "nearby"
    | "app"
;

type MapType = {
    [key in ParameterNames]: string
};

const memoryCache = new LRU<string, string>({
    maxAge: 60 * 60 * 1000,
});

function mapName(name: string, env: string = 'dev'): string {
    return `/tabler-world/${env}/${name}`;
}

/**
 * Setup DEBUG mode
 */
if (EXECUTING_OFFLINE) {
    memoryCache.set(mapName('tw-api'), JSON.stringify({
        host: process.env.API_HOST,
        key: process.env.API_KEY_PLAIN,
        batch: parseInt(process.env.API_BATCH || '', 10),
        read_batch: parseInt(process.env.API_READ_BATCH || '', 10),
    } as Param_Api));

    memoryCache.set(mapName('database'), JSON.stringify({
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    } as Param_Database));

    memoryCache.set(mapName('nearby'), JSON.stringify({
        radius: parseInt(process.env.NEARBY_RADIUS || '100000', 10),
        days: parseInt(process.env.NEARBY_DAYSBACK || '365', 10),
    } as Param_Nearby));

    memoryCache.set(mapName('app'), JSON.stringify({
        urls: {
            feedback: "https://www.google.de?q=feedback",
            profile: "https://www.google.de?q=profile",
            world: "https://www.google.de?q=world",
            join: "https://www.google.de?q=join",
            support: "no-reply@example.com",
        }
    }));
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

    if (EXECUTING_OFFLINE){
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
