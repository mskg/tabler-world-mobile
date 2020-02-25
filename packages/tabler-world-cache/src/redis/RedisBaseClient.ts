import { ILogger, Mutex } from '@mskg/tabler-world-common';
import { ClientOpts, createClient, RedisClient } from 'redis';

export abstract class RedisBaseClient {
    private initMutex: Mutex = new Mutex();
    private initialized!: Promise<any>;
    private connectTimeout!: Promise<any>;

    protected client!: RedisClient;

    constructor(
        private opts?: ClientOpts,
        protected logger: ILogger = console,
    ) {
    }

    protected abstract initClient(): void;

    connect() {
        this.logger.log('connect');
        if (this.client) {
            try {
                this.client.end();
                this.client.removeAllListeners();
            } catch (e) {
                this.logger.error('Failed to close', e);
            }
        }

        this.initialized = new Promise((resolve, reject) => {
            try {
                this.client = createClient({
                    ...(this.opts || {}),

                    no_ready_check: false,
                    enable_offline_queue: false,
                });

                this.initClient();

                // prevent race condition
                this.client.on('ready', () => {
                    this.logger.log('RedisClient', 'ready');
                    resolve();
                });

                this.client.on('error', (error) => {
                    this.logger.error('RedisClient', 'connection error', error);
                });

                this.client.on('connect', () => {
                    this.logger.log('RedisClient', 'connected');
                });

            } catch {
                reject();
            }
        });

        this.connectTimeout = Promise.race([
            new Promise((resolve) =>
                setTimeout(() => resolve(), 10 * 1000),
            ),
            this.initialized,
        ]);
    }

    protected async ensureConnected() {
        // this kills the client if is is not connected
        // as we want to wait on the init cycle
        if (!this.client || !this.client.connected) {
            // prevent race condition on client
            const unlock = await this.initMutex.lock();
            {
                if (!this.client) {
                    this.connect();
                }
            }
            unlock();

            this.logger.log('ensureConnected');
            await this.initialized;
        }
    }

    protected async isConnected() {
        // give it a chance to connect if it never was connected
        if (!this.client) {
            // prevent race condition on client
            const unlock = await this.initMutex.lock();
            {
                if (!this.client) {
                    this.connect();
                }
            }
            unlock();
        }

        this.logger.log('isConnected');
        await this.connectTimeout;
        return this.client.connected;
    }
}
