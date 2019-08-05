
import { Client as PGClient } from "pg";
import { ILogger } from "../logging/ILogger";
import { getParameters } from "../parameters/getParameters";
import { Param_Database } from "../parameters/types";
import { Client, RDS } from "../xray/Client";

// const KEY = "__db";
export async function useDatabase<T>(
    context: {
        logger: ILogger /*, requestCache: { [key: string]: any } */
    },
    func: (client: PGClient) => Promise<T>
): Promise<T> {
    const params = await getParameters('database');
    const connection = JSON.parse(params.database) as Param_Database;

    let password = connection.password;
    if (password == null || password === "") {
        context.logger.log("[DB]", "-> with token");

        const sign = new RDS.Signer();
        password = sign.getAuthToken({
            region: process.env.AWS_REGION,
            hostname: connection.host,
            port: connection.port || 5432,
            username: connection.user,
        });
    }

    const client = new Client({
        host: connection.host,
        port: connection.port || 5432,
        user: connection.user,
        database: connection.database,
        ssl: connection.ssl == null ? true : connection.ssl,
        password,
    });

    try {
        context.logger.log("[DB] connect");

        await client.connect();
        client.on("error", (...args: any[]) => context.logger.error("[SQL]", ...args));

        return await func(client);
    } finally {
        try {
            await client.end();
        }
        catch (e) {
            context.logger.error("[DB]", "Failed to close connection", e);
        }
    }
}
