
import { RDS } from "aws-sdk";
import { Client } from "pg";
import Pool from "pg-pool";
import { ILogger } from "../types/ILogger";

let pool: any = null;

export async function useDatabase<T>(logger: ILogger, func: (client: Client) => Promise<T>): Promise<T> {
    if (pool == null) {
        logger.log("[POOL]", "Bootstrapping pool");

        function PLClient() {
            logger.log("[POOL]", "Creating new connection");

            let password = process.env.db_password;
            if (password == null || password === "") {
                logger.log("[POOL]", "-> with token");

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
        con.on("error", (...args: any[]) => logger.error("[SQL]", ...args));

        return await func(con);
    } finally {
        try {
            if (con != null) {
                await con.release();
            }
        }
        catch (e) {
            logger.error("[POOL]", "Failed to close connection", e);
        }
    }
}
