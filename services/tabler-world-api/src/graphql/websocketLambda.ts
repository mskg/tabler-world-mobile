import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { APIGatewayWebSocketEvent } from 'aws-lambda-graphql';
import { protocol, ProtocolContext } from './subscriptions';
import { ClientLostError } from './subscriptions/types/ClientLostError';

// tslint:disable: export-name
export async function handler(event: APIGatewayWebSocketEvent, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const protocolContext = new ProtocolContext(event, context);
        await protocol[protocolContext.route](protocolContext);
    } catch (e) {
        if (e instanceof ClientLostError) {
            console.log('handler catched "ClientLostError", ignored.');
        } else {
            console.error('Faild websocket event', e, event);
            throw e;
        }
    }

    // OK
    return { statusCode: 200, body: '' };
}
