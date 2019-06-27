
import { RDS } from "aws-sdk";
import { Client } from "pg";
import { ILogger } from "../types/ILogger";

// const KEY = "__db";

export async function useDatabase<T>(
    context: { logger: ILogger, requestCache: { [key: string]: any } },
    func: (client: Client) => Promise<T>
): Promise<T> {
    // const cachedCon = context.requestCache[KEY];

    // if (cachedCon) {
    //     context.logger.log("************************************* [DB] using cached connection");
    //     return await func(cachedCon);
    // }

    let password = process.env.db_password;
    if (password == null || password === "") {
        context.logger.log("[DB]", "-> with token");

        const sign = new RDS.Signer();
        password = sign.getAuthToken({
            region: process.env.AWS_REGION,
            hostname: process.env.db_host,
            port: 5432,
            username: process.env.db_user,
        });
    }

    const client = new Client({
        host: process.env.db_host,
        port: 5432,
        user: process.env.db_user,
        database: process.env.db_database,
        ssl: true,
        password,
    });

    try {
        context.logger.log("[DB] connect");

        await client.connect();
        client.on("error", (...args: any[]) => context.logger.error("[SQL]", ...args));

        // context.requestCache[KEY] = client;
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
