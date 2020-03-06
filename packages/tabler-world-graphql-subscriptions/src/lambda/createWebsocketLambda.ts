import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { APIGatewayWebSocketEvent } from 'aws-lambda-graphql';
import { ProtocolContext, SubscriptionsTransportWSProtocol } from '../core/protocol';
import { ClientLostError } from '../core/types/ClientLostError';
import { SubscriptionServerContext } from '../server/SubscriptionServerContext';

export function createWebsocketLambda(server: SubscriptionServerContext<any, any>) {
    return async (event: APIGatewayWebSocketEvent, context: Context): Promise<APIGatewayProxyResult> => {
        try {
            const protocolContext = new ProtocolContext(server, context, event);
            await SubscriptionsTransportWSProtocol[protocolContext.route](protocolContext);
        } catch (e) {
            if (e instanceof ClientLostError) {
                console.log('handler catched "ClientLostError", ignored.');
            } else {
                console.error('Faild websocket event', e, event);
                return e;
            }
        }

        // OK
        return { statusCode: 200, body: '' };
    };
}
