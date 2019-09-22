import { resolvePrincipal } from '@mskg/tabler-world-auth-client';
import { APIGatewayProxyResult } from 'aws-lambda';
import { APIGatewayWebSocketEvent, WebSocketConnectEvent } from 'aws-lambda-graphql';
import { getOperationAST, parse, subscribe, validate } from 'graphql';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { ConnectionManager } from './models/ConnectionManager';
import { schema } from './schema/schema';

const SUCCESS = { statusCode: 200, body: '' };

enum Routes {
    connect = '$connect',
    disconnect = '$disconnect',
    default = '$default',
}

const connectionManager = new ConnectionManager();

// tslint:disable-next-line: export-name
export async function handler(event: APIGatewayWebSocketEvent): Promise<APIGatewayProxyResult> {
    try {
        if (!(event.requestContext && event.requestContext.connectionId)) {
            console.error(
                event,
            );

            throw new Error('Invalid event. Missing `connectionId` parameter.');
        }

        const route = event.requestContext.routeKey;
        const connectionId = event.requestContext.connectionId;

        console.log(
            'connectionId', connectionId,
            'route', route,
        );

        if (route === Routes.connect) {
            const principal = resolvePrincipal(event as WebSocketConnectEvent);
            console.log('Constructing new context for principal', principal);

            await connectionManager.connect(connectionId, principal);
            return SUCCESS;
        } if (route === Routes.disconnect) {
            await connectionManager.disconnect(connectionId);
            return SUCCESS;
        } {
            if (!event.body) {
                return SUCCESS;
            }

            const operation = JSON.parse(event.body) as OperationMessage;

            if (operation.type === MessageTypes.GQL_CONNECTION_INIT) {
                await connectionManager.sendMessage(connectionId, { type: MessageTypes.GQL_CONNECTION_ACK });
                return SUCCESS;
            }

            if (operation.type === MessageTypes.GQL_STOP) {
                return SUCCESS;
            }

            const details = await connectionManager.get(connectionId);
            if (!details) {
                throw new Error('Unknown client');
            }

            if (!operation.payload || !operation.payload.query) {
                throw new Error('Protocol error');
            }

            const { query, variables, operationName } = operation.payload;
            const graphqlDocument = parse(query as string);
            const operationAST = getOperationAST(graphqlDocument, operationName || '');

            if (!operationAST || operationAST.operation !== 'subscription') {
                await connectionManager.sendError(connectionId, { message: 'Only subscriptions are supported' });
                return SUCCESS;
            }

            const validationErrors = validate(schema, graphqlDocument);
            if (validationErrors.length > 0) {
                await connectionManager.sendError(connectionId, { errors: validationErrors });
                return SUCCESS;
            }

            try {
                await subscribe({
                    schema,
                    operationName,
                    document: graphqlDocument,
                    rootValue: operation,
                    variableValues: variables,
                    contextValue: {
                        connectionId: details.connectionId,
                        principal: details.principal,
                    },
                });

            } catch (err) {
                console.error(err);
                await connectionManager.sendError(connectionId, err);
            }

            return SUCCESS;
        }
    } catch (e) {
        console.error(event, e);
        return SUCCESS;
    }
}
