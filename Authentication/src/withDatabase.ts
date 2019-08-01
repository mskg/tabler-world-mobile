
import { Context } from "aws-lambda";
import { RDS } from "aws-sdk";
import { Client } from "pg";

export async function withDatabase<T>(ctx: Context, func: (client: Client) => Promise<T>): Promise<T> {
    ctx.callbackWaitsForEmptyEventLoop = false;

    let password = process.env.db_password || process.env.DB_PASSWORD;
    if (password == null || password === "") {
        console.log("[withDatabase]", "-> with token");

        const sign = new RDS.Signer();
        password = sign.getAuthToken({
            region: process.env.AWS_REGION,
            hostname: process.env.db_host || process.env.DB_HOST,
            port: 5432,
            username: process.env.db_user || process.env.DB_USER,
        });
    }

    const client = new Client({
        host: process.env.db_host || process.env.DB_HOST,
        port: 5432,
        user: process.env.db_user || process.env.DB_USER,
        database: process.env.db_database || process.env.DB_DATABASE,
        ssl: true,
        password,
    });

    try {
        await client.connect();

        client.on("error", (...args: any[]) => console.error("[withDatabase] [SQL]", ...args));
        return await func(client);
    }
    finally {
        try {
            await client.end();
        }
        catch (e) {
            console.error("[withDatabase]", "Failed to close connection", e);
        }
    }
}
