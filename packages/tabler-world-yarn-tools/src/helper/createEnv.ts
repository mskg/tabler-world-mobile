
import * as path from "path";
import { getEnvFileVars } from "./getEnvFileVars";

export function createEnv() {
    const here = process.cwd();
    const envFile = path.join(here, "../../config/.env");
    const localEnvFile = path.join(here, "../../config/.env.local");

    const envVars = getEnvFileVars(envFile);
    const localEnvVars = getEnvFileVars(localEnvFile);

    const finalEnv = {
        // env we define
        ...envVars,
        // local overrides
        ...localEnvVars,
        // don't redefine existing vars
        ...process.env
    };

    return finalEnv;
}
