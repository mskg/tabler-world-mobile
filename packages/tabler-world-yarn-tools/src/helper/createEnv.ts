
import * as fs from 'fs';
import * as path from 'path';
import { getEnvFileVars } from './getEnvFileVars';

export function createEnv() {
    const here = process.cwd();
    let basePath = path.join(here, '../config/');

    // tslint:disable-next-line: non-literal-fs-path
    if (!fs.existsSync(basePath)) {
        basePath = path.join(here, '../../config/');
    }

    const envFile = path.join(basePath, './.env');
    const localEnvFile = path.join(basePath, './.env.local');

    const envVars = getEnvFileVars(envFile);
    const localEnvVars = getEnvFileVars(localEnvFile);

    return {
        // env we define
        ...envVars,
        // local overrides
        ...localEnvVars,
        // don't redefine existing vars
        ...process.env,
    };
}
