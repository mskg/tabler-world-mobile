import { Client, RDS } from '@mskg/tabler-world-aws';
import { ILogger, Metric, StopWatch } from '@mskg/tabler-world-common';
import { getParameters, Param_Database } from '@mskg/tabler-world-config';
import { Client as PGClient, QueryConfig, QueryResult } from 'pg';
import { logExecutableSQL } from '../helper/logExecutableSQL';
import { IDataService } from '../types/IDataService';

export class LazyPGClient implements IDataService {
    client: PGClient | undefined;

    constructor(
        private logger: ILogger,
        private debugLog: boolean,
        private metrics?: Metric,
    ) {
    }

    async close() {
        if (this.client) {
            try {
                this.client.removeAllListeners();
                await this.client.end();
                this.client = undefined;
            } catch (e) {
                this.logger.error('[SQL]', 'Failed to close connection', e);
            }
        }
    }

    async connect() {
        if (!this.client) {
            const params = await getParameters('database');
            const connection = JSON.parse(params.database) as Param_Database;
            let password = connection.password;

            // tslint:disable-next-line: possible-timing-attack
            if (password == null || password === '') {
                this.logger.debug('[SQL]', '-> with token');
                const sign = new RDS.Signer();
                password = sign.getAuthToken({
                    region: process.env.AWS_REGION,
                    hostname: connection.host,
                    port: connection.port || 5432,
                    username: connection.user,
                });
            }

            // tslint:disable: object-shorthand-properties-first
            this.client = new Client({
                host: connection.host,
                port: connection.port || 5432,
                user: connection.user,
                password,
                database: connection.database,
                // ssl mode = require
                // https://github.com/brianc/node-postgres/issues/2089s
                ssl: connection.ssl === false ? false : { rejectUnauthorized: false },
            });

            this.logger.debug('[SQL]', 'connect');
            await this.client.connect();
            this.client.on('error', (...args: any[]) => this.logger.error('[SQL]', ...args));
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
            return await this.client!.query(text, parameters);
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
