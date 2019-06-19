
import { RDS } from "aws-sdk";
import { Client } from "pg";
import Pool from "pg-pool";
import { ILogger } from "../types/ILogger";

let pool: any = null;
const KEY = "__db";

export async function useDatabase<T>(
    context: {logger: ILogger, requestCache: {[key: string]: any}},
    func: (client: Client) => Promise<T>
): Promise<T> {
    const cachedCon = context.requestCache[KEY];
    if (cachedCon) {
        context.logger.log("Using cached connection");
        return await func(cachedCon);
    }

    if (pool == null) {
        context.logger.log("[POOL]", "Bootstrapping pool");

        function PLClient() {
            context.logger.log("[POOL]", "Creating new connection");

            let password = process.env.db_password;
            if (password == null || password === "") {
                context.logger.log("[POOL]", "-> with token");

                const sign = new RDS.Signer();
                password = sign.getAuthToken({
                    region: process.env.AWS_REGION,
                    hostname: process.env.db_host,
                    port: 5432,
                    username: process.env.db_user,
                });
            }

            return new Client({
                host: process.env.db_host,
                port: 5432,
                user: process.env.db_user,
                database: process.env.db_database,
                ssl: true,
                password: password,
            });
        }

        //@ts-ignore (wrong!)
        // times must be shorter than execution time?
        pool = new Pool({
            idleTimeoutMillis: 60 * 1000,
            connectionTimeoutMillis: 10 * 1000,
        }, PLClient);
    }

    let con: any = null;

    try {
        con = await pool.connect();
        context.requestCache[KEY] = con;

        con.on("error", (...args: any[]) => context.logger.error("[SQL]", ...args));
        return await func(con);
    } finally {
        try {
            if (con != null) {
                await con.release();
            }
        }
        catch (e) {
            context.logger.error("[POOL]", "Failed to close connection", e);
        }
    }
}
