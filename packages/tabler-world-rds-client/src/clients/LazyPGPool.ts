import { RDS } from '@mskg/tabler-world-aws';
import { ILogger, Metric, StopWatch } from '@mskg/tabler-world-common';
import { getParameters, Param_Database } from '@mskg/tabler-world-config';
import { Pool, QueryConfig, QueryResult } from 'pg';
import { logExecutableSQL } from '../helper/logExecutableSQL';
import { IPooledDataService } from '../types/IPooledDataService';

export class LazyPGPool implements IPooledDataService {
    pool: Pool | undefined;

    constructor(
        private poolSize: number,
        private logger: ILogger,
        private debugLog: boolean,
        private metrics?: Metric,
    ) {
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
                this.logger.debug('-> with token');
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
                password,
                database: connection.database,
                // https://github.com/brianc/node-postgres/issues/2089s
                // tslint:disable-next-line: triple-equals
                ssl: connection.ssl == false ? false : { rejectUnauthorized: false },
                max: this.poolSize,
                application_name: process.env.AWS_LAMBDA_FUNCTION_NAME || process.title || 'unknown',
            });

            this.logger.debug('[SQL]', 'connect');

            this.pool.on('error', (...args: any[]) => this.logger.error('[SQL]', ...args));
            this.pool.on('connect', () => this.logger.debug('[SQL]', 'connect'));
        }
    }

    async query<T = any, I extends any[] = any[]>(text: string | QueryConfig<I>, parameters?: I): Promise<QueryResult<T>> {
        await this.connect();

        const id = `SQL${Date.now().toString()}`;
        if (this.debugLog) {
            logExecutableSQL(
                this.logger.debug.bind(this.logger),
                id,
                typeof (text) === 'string' ? text : text.text,
                parameters,
            );
        }

        const sw = new StopWatch();
        try {
            return await this.pool!.query(text, parameters);
        } catch (e) {
            logExecutableSQL(
                this.logger.error.bind(this.logger),
                id,
                typeof (text) === 'string' ? text : text.text,
                parameters,
            );

            throw e;
        } finally {
            if (this.metrics) {
                this.metrics.add({ id: 'sql-latency', value: sw.elapsedYs, unit: 'μs' });
            }

            if (this.debugLog) {
                this.logger.debug('[SQL]', id, 'took', sw.elapsedYs, 'ys');
            }
        }
    }
}
