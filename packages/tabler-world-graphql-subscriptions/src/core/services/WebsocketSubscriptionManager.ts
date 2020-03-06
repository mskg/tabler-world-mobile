import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { ClientLostError } from '../types/ClientLostError';
import { ISubscription } from '../types/ISubscription';
import { ISubscriptionStorage } from '../types/ISubscriptionStorage';
import { getWebsocketParams } from '../utils/getWebsocketParams';
import { WebsocketConnectionManager } from './WebsocketConnectionManager';

const logger = new ConsoleLogger('ws:subscription');

export class WebsocketSubscriptionManager<TConnectionContext> {
    constructor(
        private connection: WebsocketConnectionManager<TConnectionContext>,
        private storage: ISubscriptionStorage,
    ) {
    }

    public async hasSubscribers(triggers: string[]): Promise<string[]> {
        logger.debug('hasSubscribers', triggers);
        return await this.storage.hasSubscribers(triggers);
    }

    public async getSubscriptions(trigger: string): Promise<ISubscription<TConnectionContext>[]> {
        logger.debug('getSubscriptions', trigger);
        return await this.storage.list(trigger);
    }

    public async subscribe(
        context: { connectionId: string, principal: IPrincipal, clientInfo: TConnectionContext },
        subscriptionId: string,
        triggers: string[],
        payload: any,
    ): Promise<void> {
        const params = await getWebsocketParams();

        return await this.storage.put(
            triggers,
            {
                subscriptionId,
                payload,
                connection: {
                    connectionId: context.connectionId,
                    // @ts-ignore
                    context: context.clientInfo,
                    principal: context.principal,
                    memberId: context.principal.id,
                },
            },
            params.ttlSubscription,
        );
    }

    public async unsubscribe(connectionId: string, subscriptionId: string): Promise<void> {
        logger.log(`[${connectionId}] [${subscriptionId}]`, 'unsubscribe');
        await this.storage.remove(connectionId, subscriptionId);
    }

    public async unsubscribeAll(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'unsubscribeAll');
        await this.storage.remove(connectionId);
    }

    public async sendData(connectionId: string, subscriptionId: string, payload: any): Promise<void> {
        try {
            await this.connection.sendMessage(
                connectionId,
                {
                    payload,
                    id: subscriptionId,
                    type: MessageTypes.GQL_DATA,
                },
            );
        } catch (err) {
            // connection does no longeer exist
            if (err instanceof ClientLostError) {
                await this.unsubscribe(connectionId, subscriptionId);
                await this.unsubscribeAll(connectionId);
            }

            throw err;
        }
    }
}
