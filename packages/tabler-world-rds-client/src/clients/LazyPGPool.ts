import { RDS } from '@mskg/tabler-world-aws';
import { ILogger, StopWatch } from '@mskg/tabler-world-common';
import { getParameters, Param_Database } from '@mskg/tabler-world-config';
import { Pool, QueryConfig, QueryResult } from 'pg';
import { logExecutableSQL } from '../helper/logExecutableSQL';
import { IPooledDataService } from '../types/IPooledDataService';

export class LazyPGPool implements IPooledDataService {
    pool: Pool | undefined;

    constructor(private logger: ILogger, private poolSize: number) {
    }

    async close() {
        if (this.pool) {
            try {
                await this.pool.end();
                this.pool = undefined;
            } catch (e) {
                this.logger.error('[SQL]', 'Failed to close connection', e);
            }
        }
    }

    async connect() {
        if (!this.pool) {
            const params = await getParameters('database');
            const connection = JSON.parse(params.database) as Param_Database;
            let password = connection.password;

            // tslint:disable-next-line: possible-timing-attack
            if (password == null || password === '') {
                this.logger.log('-> with token');
                const sign = new RDS.Signer();
                password = sign.getAuthToken({
                    region: process.env.AWS_REGION,
                    hostname: connection.host,
                    port: connection.port || 5432,
                    username: connection.user,
                });
            }

            // tslint:disable: object-shorthand-properties-first
            this.pool = new Pool({
                host: connection.host,
                port: connection.port || 5432,
                user: connection.user,
                database: connection.database,
                ssl: connection.ssl == null ? true : connection.ssl,

                password,
                max: this.poolSize,
            });

            this.logger.log('[SQL]', 'connect');
            await this.pool.connect();

            this.pool.on('error', (...args: any[]) => this.logger.error('[SQL]', ...args));
            this.pool.on('connect', () => this.logger.log('[SQL]', 'connect'));
        }
    }

    async query<T = any, I extends any[] = any[]>(text: string | QueryConfig<I>, parameters?: I): Promise<QueryResult<T>> {
        await this.connect();

        const id = `SQL${Date.now().toString()}`;
        logExecutableSQL(
            this.logger,
            id,
            typeof (text) === 'string' ? text : text.text,
            parameters,
        );

        const sw = new StopWatch();
        try {
            return await this.pool!.query(text, parameters);
        } finally {
            this.logger.log('[SQL]', id, 'took', sw.elapsedYs, 'ys');
        }
    }
}
