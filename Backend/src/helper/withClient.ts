
import { Context } from "aws-lambda";
import { RDS } from "aws-sdk";
import { Client } from "pg";
import Pool from "pg-pool";

let pool: any = null;

export async function withClient<T>(ctx: Context, func: (client: Client) => Promise<T>): Promise<T> {
    if (pool == null) {
        console.log("Pool does not exist.");

        function PLClient() {
            console.log("Creating new connection");

            let password = process.env.db_password;
            if (password == null || password === "") {
                console.log("-> with token");

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
    ctx.callbackWaitsForEmptyEventLoop = false;

    let con: any = null;

    try {
        con = await pool.connect();
        return await func(con);
    } finally {
        try {
            if (con != null) {
                await con.release();
            }
        }
        catch (e) {
            console.error("Failed to close connection", e);
        }
    }
}
